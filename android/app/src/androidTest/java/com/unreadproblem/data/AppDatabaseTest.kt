package com.unreadproblem.data

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class AppDatabaseTest {
    private lateinit var db: AppDatabase

    @Before fun setUp() {
        db = Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext(), AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
    }

    @After fun tearDown() = db.close()

    @Test fun duplicatePrimaryKeyIsIgnoredAndAcknowledgementPersists() = runBlocking {
        val message = MessageEntity("same", "com.whatsapp", "Alice", "alice", "Submit", 1L, "MEDIUM", 2, "Action")
        assertTrue(db.messageDao().insert(message) >= 0)
        assertEquals(-1L, db.messageDao().insert(message))
        db.messageDao().acknowledge("same")
        assertTrue(db.messageDao().getRecent(1).single().acknowledged)
    }

    @Test fun reminderStatePersists() = runBlocking {
        val reminder = ReminderEntity("r1", null, "Title", "Body", 10_000L)
        db.reminderDao().upsert(reminder)
        assertEquals(listOf(reminder), db.reminderDao().getFutureScheduled(1L))
        db.reminderDao().setStatus("r1", "DELIVERED", null)
        assertTrue(db.reminderDao().getFutureScheduled(1L).isEmpty())
    }
}
