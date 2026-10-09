package com.unreadproblem.data

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "captured_messages", indices = [Index("timestamp"), Index("priority"), Index("conversationKey")])
data class MessageEntity(
    @PrimaryKey val id: String,
    val sourcePackage: String,
    val conversation: String,
    val conversationKey: String,
    val messageText: String,
    val timestamp: Long,
    val priority: String,
    val score: Int,
    val reason: String,
    val acknowledged: Boolean = false,
    val notificationKey: String = "",
    val capturedAt: Long = System.currentTimeMillis(),
    val contentHash: String = "",
    val processingStatus: String = "RULES_CLASSIFIED",
    val classifierVersion: String = "rules-v1",
)

@Entity(tableName = "action_items", indices = [Index("dueAt"), Index("status"), Index("category")])
data class ActionItemEntity(
    @PrimaryKey val id: String,
    val sourceMessageId: String,
    val title: String,
    val dueAt: Long?,
    val priority: String,
    val reason: String,
    val category: String? = null,
    val status: String = "OPEN",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "reminders",
    indices = [Index("actionItemId"), Index("scheduledAt"), Index("status")],
)
data class ReminderEntity(
    @PrimaryKey val id: String,
    val actionItemId: String?,
    val title: String,
    val body: String,
    val scheduledAt: Long,
    val status: String = "SCHEDULED",
    val acknowledgedAt: Long? = null,
    val snoozedUntil: Long? = null,
)
