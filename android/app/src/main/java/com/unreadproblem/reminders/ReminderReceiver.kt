package com.unreadproblem.reminders

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.content.pm.PackageManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.unreadproblem.MainActivity
import com.unreadproblem.data.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val reminderId = intent.getStringExtra("reminder_id") ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            updateStatus(context, reminderId, "PERMISSION_DENIED")
            return
        }
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "urgent_reminders"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(NotificationChannel(channelId, "Urgent reminders", NotificationManager.IMPORTANCE_HIGH))
        }
        val openApp = PendingIntent.getActivity(context, 0, Intent(context, MainActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(context.applicationInfo.icon)
            .setContentTitle(intent.getStringExtra("title") ?: "Important reminder")
            .setContentText(intent.getStringExtra("body") ?: "You have an important task.")
            .setStyle(NotificationCompat.BigTextStyle().bigText(intent.getStringExtra("body") ?: "You have an important task."))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setAutoCancel(true).setContentIntent(openApp).build()
        manager.notify((intent.getStringExtra("reminder_id") ?: System.currentTimeMillis().toString()).hashCode(), notification)
        updateStatus(context, reminderId, "DELIVERED")
    }

    private fun updateStatus(context: Context, reminderId: String, status: String) {
        val pending = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try { AppDatabase.getInstance(context).reminderDao().setStatus(reminderId, status, null) }
            finally { pending.finish() }
        }
    }
}

class ReminderRescheduleReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action !in setOf(Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED)) return
        val pending = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                AppDatabase.getInstance(context).reminderDao().getFutureScheduled(System.currentTimeMillis()).forEach { reminder ->
                    ReminderScheduler.schedule(context, reminder.id, reminder.title, reminder.body, reminder.scheduledAt)
                }
            } finally { pending.finish() }
        }
    }
}
