package com.unreadproblem.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface MessageDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(message: MessageEntity): Long

    @Query("UPDATE captured_messages SET priority = :priority, score = :score, reason = :reason, processingStatus = 'MODEL_CLASSIFIED', classifierVersion = :classifierVersion WHERE id = :id")
    suspend fun updateClassification(id: String, priority: String, score: Int, reason: String, classifierVersion: String)

    @Query("UPDATE captured_messages SET processingStatus = :status WHERE id = :id")
    suspend fun setProcessingStatus(id: String, status: String)

    @Query("SELECT * FROM captured_messages ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecent(limit: Int): List<MessageEntity>

    @Query("SELECT * FROM captured_messages WHERE timestamp >= :since ORDER BY timestamp ASC LIMIT :limit")
    suspend fun getSince(since: Long, limit: Int): List<MessageEntity>

    @Query("SELECT * FROM captured_messages WHERE conversationKey = :key ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getConversation(key: String, limit: Int): List<MessageEntity>

    @Query("UPDATE captured_messages SET acknowledged = 1 WHERE id = :id")
    suspend fun acknowledge(id: String)

    @Query("DELETE FROM captured_messages")
    suspend fun deleteAllMessages()

    @Query("SELECT COUNT(*) FROM captured_messages")
    suspend fun count(): Int
}

@Dao
interface ActionItemDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(item: ActionItemEntity)

    @Query("SELECT * FROM action_items WHERE status = 'OPEN' ORDER BY CASE WHEN dueAt IS NULL THEN 1 ELSE 0 END, dueAt ASC LIMIT :limit")
    suspend fun getOpen(limit: Int): List<ActionItemEntity>

    @Query("UPDATE action_items SET status = :status WHERE id = :id")
    suspend fun setStatus(id: String, status: String)

    @Query("DELETE FROM action_items")
    suspend fun deleteAll()
}

@Dao
interface ReminderDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(reminder: ReminderEntity)

    @Query("SELECT * FROM reminders WHERE status = 'SCHEDULED' AND scheduledAt > :now ORDER BY scheduledAt")
    suspend fun getFutureScheduled(now: Long): List<ReminderEntity>

    @Query("SELECT * FROM reminders WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): ReminderEntity?

    @Query("SELECT * FROM reminders WHERE actionItemId = :actionId AND status = 'SCHEDULED'")
    suspend fun getScheduledForAction(actionId: String): List<ReminderEntity>

    @Query("UPDATE reminders SET status = :status, acknowledgedAt = :acknowledgedAt WHERE id = :id")
    suspend fun setStatus(id: String, status: String, acknowledgedAt: Long?)

    @Query("UPDATE reminders SET scheduledAt = :scheduledAt, snoozedUntil = :scheduledAt, status = 'SCHEDULED' WHERE id = :id")
    suspend fun snooze(id: String, scheduledAt: Long)

    @Query("UPDATE reminders SET status = 'CANCELLED' WHERE actionItemId = :actionId AND status = 'SCHEDULED'")
    suspend fun cancelForAction(actionId: String)

    @Query("DELETE FROM reminders")
    suspend fun deleteAll()
}
