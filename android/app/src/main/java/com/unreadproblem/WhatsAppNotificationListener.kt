package com.unreadproblem

import android.app.Notification
import android.content.ComponentName
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.unreadproblem.ai.LocalLlm
import com.unreadproblem.classifier.MessageClassifier
import com.unreadproblem.classifier.CategoryClassifier
import com.unreadproblem.classifier.DeadlineParser
import com.unreadproblem.classifier.NotificationTextNormalizer
import com.unreadproblem.classifier.HybridClassifier
import com.unreadproblem.data.ActionItemEntity
import com.unreadproblem.data.AppDatabase
import com.unreadproblem.data.MessageEntity
import com.unreadproblem.data.ReminderEntity
import com.unreadproblem.reminders.ReminderScheduler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.security.MessageDigest
import java.util.Locale

class WhatsAppNotificationListener : NotificationListenerService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var db: AppDatabase
    private lateinit var llm: LocalLlm

    override fun onCreate() {
        super.onCreate()
        db = AppDatabase.getInstance(applicationContext)
        llm = LocalLlm(applicationContext)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (sbn.packageName != "com.whatsapp") return
        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()?.trim().orEmpty()
        val messagingLines = extras.getParcelableArray(Notification.EXTRA_MESSAGES)
            ?.mapNotNull { (it as? android.os.Bundle)?.getCharSequence("text")?.toString() }
        val textLines = messagingLines?.takeIf { it.isNotEmpty() }
            ?: extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES)?.map { it?.toString() }
        val body = NotificationTextNormalizer.select(
            extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString(),
            extras.getCharSequence(Notification.EXTRA_TEXT)?.toString(),
            textLines,
        ) ?: return
        val ts = sbn.postTime
        val key = stableId("${sbn.packageName}|$title")
        // Excluding postTime makes a re-post of identical content idempotent while a changed
        // notification body remains a distinct historical record.
        val contentHash = stableId("$title|${body.lowercase(Locale.ROOT).trim()}")
        val id = stableId("${sbn.key}|$contentHash")
        val baseline = MessageClassifier.classify(body)
        scope.launch {
            // Persist the deterministic result first; local model loading must never delay capture.
            var priority = baseline.priority
            var score = baseline.score
            var reason = baseline.reason
            val msg = MessageEntity(
                id = id,
                sourcePackage = sbn.packageName,
                conversation = title.ifBlank { "WhatsApp" },
                conversationKey = key,
                messageText = body,
                timestamp = ts,
                priority = priority,
                score = score,
                reason = reason,
                notificationKey = sbn.key,
                contentHash = contentHash,
            )
            val inserted = db.messageDao().insert(msg)
            if (inserted == -1L) return@launch
            UnreadProblemEvents.messagesChanged()

            // Only ambiguous messages use the model. Invalid output/timeouts keep the rules result.
            if (HybridClassifier.shouldUseModel(baseline, llm.isModelInstalled())) {
                val context = db.messageDao().getConversation(key, 9).asReversed()
                    .filter { it.id != id }
                    .takeLast(8)
                    .map { it.messageText }
                val modelResult = llm.classify(body, context)
                val refined = HybridClassifier.merge(baseline, modelResult)
                priority = refined.priority
                score = refined.score
                reason = refined.reason
                if (refined != baseline) {
                    db.messageDao().updateClassification(id, priority, score, reason, "litertlm-0.16.1")
                    UnreadProblemEvents.messagesChanged()
                }
                else db.messageDao().setProcessingStatus(id, "RULES_FALLBACK")
            }
            val due = DeadlineParser.parse(body, ts)?.takeIf { it > System.currentTimeMillis() }
            if (priority == "HIGH" && due != null && due > System.currentTimeMillis()) {
                                val actionId = stableId("$id|deadline|$due")
                val category = CategoryClassifier.inferCategory(body.take(120), "Explicit relative deadline detected", title)
                db.actionItemDao().upsert(ActionItemEntity(actionId, id, body.take(120), due, priority, "Explicit relative deadline detected", category))
                // First alert now; reminder 30 minutes before deadline, or immediately if too close.
                schedulePersisted("$actionId-now", actionId, "Important WhatsApp message", body.take(180), System.currentTimeMillis() + 1500)
                val reminderAt = maxOf(System.currentTimeMillis() + 5000, due - 30 * 60 * 1000L)
                if (reminderAt < due) schedulePersisted(actionId, actionId, "Deadline approaching", body.take(180), reminderAt)
            } else if (priority == "HIGH") {
                schedulePersisted("$id-now", null, "Important WhatsApp message", body.take(180), System.currentTimeMillis() + 1500)
            }
        }
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        NotificationListenerService.requestRebind(ComponentName(this, WhatsAppNotificationListener::class.java))
    }

    private suspend fun schedulePersisted(id: String, actionId: String?, title: String, body: String, at: Long) {
        val reminder = ReminderEntity(id, actionId, title, body, at)
        db.reminderDao().upsert(reminder)
        if (!ReminderScheduler.schedule(applicationContext, id, title, body, at)) {
            db.reminderDao().setStatus(id, "FAILED", null)
        }
    }

    private fun stableId(value: String) = MessageDigest.getInstance("SHA-256").digest(value.toByteArray()).joinToString("") { "%02x".format(it) }
    override fun onDestroy() { scope.cancel(); llm.close(); super.onDestroy() }
}
