package com.unreadproblem

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.unreadproblem.ai.LocalLlm
import com.unreadproblem.data.AppDatabase
import com.unreadproblem.reminders.ReminderScheduler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import androidx.room.withTransaction
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

class UnreadProblemModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
    private val modelDownloadUrl = "https://huggingface.co/litert-community/functiongemma-mobile-actions_q8_ekv1024.litertlm/resolve/main/mobile-actions_q8_ekv1024.litertlm?download=true"
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val db = AppDatabase.getInstance(ctx)
    private var voicePromise: Promise? = null
    private val voiceRequestCode = 7412
    private var modelPromise: Promise? = null
    private val modelRequestCode = 7413
    private val activityListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == modelRequestCode) {
                val pending = modelPromise ?: return
                modelPromise = null
                if (resultCode != Activity.RESULT_OK || data?.data == null) {
                    pending.resolve(false)
                    return
                }
                val uri = data.data ?: return
                scope.launch {
                    try {
                        val directory = File(ctx.filesDir, "models").apply { mkdirs() }
                        val temporary = File(directory, "model.litertlm.tmp")
                        ctx.contentResolver.openInputStream(uri).use { input ->
                            requireNotNull(input) { "Unable to read the selected model" }
                            temporary.outputStream().use { output -> input.copyTo(output) }
                        }
                        require(temporary.length() > 0L) { "The selected model file is empty" }
                        val target = File(directory, "model.litertlm")
                        check(temporary.renameTo(target) || temporary.copyTo(target, overwrite = true).let { temporary.delete(); true }) {
                            "Unable to install the selected model"
                        }
                        pending.resolve(true)
                    } catch (error: Exception) {
                        pending.reject("MODEL_INSTALL_FAILED", error)
                    }
                }
                return
            }
            if (requestCode != voiceRequestCode) return
            val pending = voicePromise ?: return
            voicePromise = null
            if (resultCode == Activity.RESULT_OK) {
                val results = data?.getStringArrayListExtra(android.speech.RecognizerIntent.EXTRA_RESULTS)
                pending.resolve(results?.firstOrNull().orEmpty())
            } else {
                pending.resolve("")
            }
        }
    }
    init { UnreadProblemEvents.attach(ctx); ctx.addActivityEventListener(activityListener) }
    override fun getName() = "UnreadProblem"

    @ReactMethod fun openNotificationSettings() {
        ctx.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    @ReactMethod fun isNotificationAccessEnabled(p: Promise) {
        val enabled = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners")?.split(":")?.any {
            ComponentName.unflattenFromString(it)?.packageName == ctx.packageName
        } ?: false
        p.resolve(enabled)
    }
    @ReactMethod fun openExactAlarmSettings() { ReminderScheduler.openExactAlarmSettings(ctx) }
    @ReactMethod fun isReminderPermissionGranted(p: Promise) {
        p.resolve(Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED)
    }
    @ReactMethod fun isLlmModelInstalled(p: Promise) { p.resolve(LocalLlm(ctx).isModelInstalled()) }
    @ReactMethod fun downloadLlmModel(p: Promise) { scope.launch {
        val connection = (URL(modelDownloadUrl).openConnection() as HttpURLConnection).apply {
            connectTimeout = 15_000
            readTimeout = 60_000
            requestMethod = "GET"
            instanceFollowRedirects = true
        }
        try {
            connection.connect()
            require(connection.responseCode in 200..299) { "Model download failed with HTTP ${connection.responseCode}" }
            val directory = File(ctx.filesDir, "models").apply { mkdirs() }
            val temporary = File(directory, "model.litertlm.download")
            connection.inputStream.use { input ->
                temporary.outputStream().use { output ->
                    val buffer = ByteArray(1024 * 1024)
                    while (true) {
                        val count = input.read(buffer)
                        if (count < 0) break
                        output.write(buffer, 0, count)
                    }
                }
            }
            require(temporary.length() > 0L) { "Downloaded model is empty" }
            val target = File(directory, "model.litertlm")
            check(temporary.renameTo(target) || temporary.copyTo(target, overwrite = true).let { temporary.delete(); true }) {
                "Unable to install downloaded model"
            }
            p.resolve(true)
        } catch (error: Exception) {
            p.reject("MODEL_DOWNLOAD_FAILED", error)
        } finally {
            connection.disconnect()
        }
    } }
    @ReactMethod fun pickLlmModel(p: Promise) {
        val activity = ctx.getCurrentActivity()
        if (activity == null) { p.reject("NO_ACTIVITY", "Model installation needs an active screen"); return }
        if (modelPromise != null) { p.reject("MODEL_BUSY", "Model installation is already active"); return }
        modelPromise = p
        try {
            activity.startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "*/*"
            }, modelRequestCode)
        } catch (error: Exception) {
            modelPromise = null
            p.reject("MODEL_PICKER_UNAVAILABLE", error)
        }
    }
    @ReactMethod fun restartApp(p: Promise) {
        val activity = ctx.getCurrentActivity()
        if (activity == null) { p.reject("NO_ACTIVITY", "App restart needs an active screen"); return }
        activity.runOnUiThread {
            activity.recreate()
            p.resolve(true)
        }
    }
    @ReactMethod fun startVoiceInput(p: Promise) {
        val activity = ctx.getCurrentActivity()
        if (activity == null) { p.reject("NO_ACTIVITY", "Voice input needs an active screen"); return }
        if (voicePromise != null) { p.reject("VOICE_BUSY", "Voice input is already active"); return }
        val intent = Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL, android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, "en-IN")
            putExtra(android.speech.RecognizerIntent.EXTRA_PROMPT, "Ask about your notification history")
        }
        try {
            voicePromise = p
            activity!!.startActivityForResult(intent, voiceRequestCode)
        } catch (e: Exception) {
            voicePromise = null
            p.reject("VOICE_UNAVAILABLE", e)
        }
    }
    @ReactMethod fun addListener(eventName: String) { /* Required by React Native NativeEventEmitter. */ }
    @ReactMethod fun removeListeners(count: Int) { /* Events are database-backed; no native resource per listener. */ }
    @ReactMethod fun getModelStatus(p: Promise) {
        val llm = LocalLlm(ctx)
        p.resolve(Arguments.createMap().apply {
            putString("mode", if (llm.isModelInstalled()) "HYBRID" else "RULES_ONLY")
            putBoolean("installed", llm.isModelInstalled())
            putDouble("sizeBytes", llm.modelSizeBytes().toDouble())
            putString("runtime", "LiteRT-LM 0.16.1 (CPU)")
            putString("expectedPath", llm.expectedModelPath())
        })
    }

    @ReactMethod fun getRecentMessages(limit: Int, p: Promise) { scope.launch {
        try {
            val rows = db.messageDao().getRecent(limit.coerceIn(1, 500))
            val array = Arguments.createArray()
            rows.forEach { row -> array.pushMap(Arguments.createMap().apply {
                putString("id", row.id); putString("conversation", row.conversation); putString("conversationKey", row.conversationKey); putString("messageText", row.messageText)
                putDouble("timestamp", row.timestamp.toDouble()); putString("priority", row.priority); putInt("score", row.score)
                putString("reason", row.reason); putBoolean("acknowledged", row.acknowledged)
            }) }
            p.resolve(array)
        } catch (e: Exception) { p.reject("READ_FAILED", e) }
    } }
    @ReactMethod fun getOpenActions(limit: Int, p: Promise) { scope.launch {
        try {
            val rows = db.actionItemDao().getOpen(limit.coerceIn(1, 200)); val array = Arguments.createArray()
            rows.forEach { row -> array.pushMap(Arguments.createMap().apply {
                putString("id", row.id); putString("title", row.title); if (row.dueAt == null) putNull("dueAt") else putDouble("dueAt", row.dueAt.toDouble())
                putString("priority", row.priority); putString("reason", row.reason); putString("status", row.status)
                if (row.category == null) putNull("category") else putString("category", row.category)
            }) }; p.resolve(array)
        } catch (e: Exception) { p.reject("ACTIONS_FAILED", e) }
    } }
    @ReactMethod fun setActionStatus(id: String, status: String, p: Promise) { scope.launch {
        try {
            require(status in setOf("OPEN", "DONE", "DISMISSED")) { "Unsupported action status" }
            if (status != "OPEN") {
                db.reminderDao().getScheduledForAction(id).forEach { ReminderScheduler.cancel(ctx, it.id) }
            }
            db.withTransaction {
                db.actionItemDao().setStatus(id, status)
                if (status != "OPEN") db.reminderDao().cancelForAction(id)
            }
            p.resolve(true)
        }
        catch (e: Exception) { p.reject("ACTION_UPDATE_FAILED", e) }
    } }
    @ReactMethod fun snoozeReminder(id: String, timestamp: Double, p: Promise) { scope.launch {
        try {
            val at = timestamp.toLong()
            require(at > System.currentTimeMillis()) { "Snooze time must be in the future" }
            val reminder = requireNotNull(db.reminderDao().getById(id)) { "Reminder not found" }
            ReminderScheduler.cancel(ctx, id)
            db.reminderDao().snooze(id, at)
            if (!ReminderScheduler.schedule(ctx, id, reminder.title, reminder.body, at)) {
                db.reminderDao().setStatus(id, "FAILED", null)
                error("Unable to schedule reminder")
            }
            p.resolve(true)
        } catch (e: Exception) { p.reject("REMINDER_SNOOZE_FAILED", e) }
    } }
    @ReactMethod fun cancelReminder(id: String, p: Promise) { scope.launch {
        try {
            ReminderScheduler.cancel(ctx, id)
            db.reminderDao().setStatus(id, "CANCELLED", null)
            p.resolve(true)
        } catch (e: Exception) { p.reject("REMINDER_CANCEL_FAILED", e) }
    } }
    @ReactMethod fun acknowledgeReminder(id: String, p: Promise) { scope.launch {
        try {
            ReminderScheduler.cancel(ctx, id)
            db.reminderDao().setStatus(id, "ACKNOWLEDGED", System.currentTimeMillis())
            p.resolve(true)
        } catch (e: Exception) { p.reject("REMINDER_ACK_FAILED", e) }
    } }
    @ReactMethod fun getConversationSummary(conversationKey: String, p: Promise) { scope.launch {
        try {
            val rows = db.messageDao().getConversation(conversationKey, 30).reversed()
            val llm = LocalLlm(ctx)
            val summary = llm.summarize(rows.map { "${it.conversation}: ${it.messageText}" })
            llm.close()
            p.resolve(summary ?: rows.takeLast(10).joinToString("\n") { "• ${it.messageText.take(220)}" })
        } catch (e: Exception) { p.reject("SUMMARY_FAILED", e) }
    } }
    @ReactMethod fun getTodaySummary(p: Promise) { scope.launch {
        try {
            val since = System.currentTimeMillis() - 24L * 60L * 60L * 1000L
            val rows = db.messageDao().getSince(since, 250)
            if (rows.isEmpty()) { p.resolve(""); return@launch }
            val llm = LocalLlm(ctx)
            val generated = llm.summarize(rows.map { "${it.conversation}: ${it.messageText}" })
            llm.close()
            p.resolve(generated ?: rows.takeLast(12).joinToString("\n") { "• ${it.conversation}: ${it.messageText.take(220)}" })
        } catch (e: Exception) { p.reject("TODAY_SUMMARY_FAILED", e) }
    } }
    @ReactMethod fun askHistory(question: String, p: Promise) { scope.launch {
        try {
            require(question.isNotBlank()) { "Question is required" }
            val messages = db.messageDao().getRecent(250).reversed()
            val actions = db.actionItemDao().getOpen(100)
            if (messages.isEmpty() && actions.isEmpty()) { p.resolve(""); return@launch }
            val context = buildString {
                appendLine("NOTIFICATIONS:")
                messages.forEach { appendLine("${it.timestamp} | ${it.conversation} | ${it.priority} | ${it.messageText}") }
                appendLine("OPEN TODOS:")
                actions.forEach { appendLine("${it.dueAt ?: "unknown"} | ${it.category ?: "uncategorized"} | ${it.priority} | ${it.title}") }
            }.takeLast(9_000)
            val llm = LocalLlm(ctx)
            val generated = llm.generate("""Answer the user's question using ONLY the private on-device records below. If the records do not contain the answer, say so. Be concise and mention relevant dates or senders. Do not invent facts.
QUESTION: ${question.take(800)}
$context""")
            llm.close()
            p.resolve(generated ?: "")
        } catch (e: Exception) { p.reject("HISTORY_ANSWER_FAILED", e) }
    } }
    @ReactMethod fun acknowledgeMessage(id: String, p: Promise) { scope.launch {
        try { db.messageDao().acknowledge(id); p.resolve(true) } catch (e: Exception) { p.reject("ACK_FAILED", e) }
    } }
    @ReactMethod fun deleteAllMessages(p: Promise) { scope.launch {
        try {
            db.reminderDao().getFutureScheduled(System.currentTimeMillis()).forEach { ReminderScheduler.cancel(ctx, it.id) }
            db.withTransaction {
                db.reminderDao().deleteAll()
                db.actionItemDao().deleteAll()
                db.messageDao().deleteAllMessages()
            }
            p.resolve(true)
        } catch (e: Exception) { p.reject("DELETE_FAILED", e) }
    } }
    override fun invalidate() {
        voicePromise?.reject("VOICE_CANCELLED", "The app closed voice input")
        voicePromise = null
        modelPromise?.reject("MODEL_CANCELLED", "The app closed model selection")
        modelPromise = null
        ctx.removeActivityEventListener(activityListener)
        UnreadProblemEvents.detach(ctx); scope.cancel(); super.invalidate()
    }
}

object UnreadProblemEvents {
    @Volatile private var context: ReactApplicationContext? = null
    fun attach(value: ReactApplicationContext) { context = value }
    fun detach(value: ReactApplicationContext) { if (context === value) context = null }
    fun messagesChanged() {
        val reactContext = context ?: return
        reactContext.runOnUiQueueThread {
            if (reactContext.hasActiveReactInstance()) {
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("UnreadProblemMessagesChanged", null)
            }
        }
    }
}
