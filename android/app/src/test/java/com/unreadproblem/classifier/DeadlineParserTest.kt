package com.unreadproblem.classifier

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.util.Calendar
import java.util.TimeZone

class DeadlineParserTest {
    private val zone = TimeZone.getTimeZone("Asia/Kolkata")
    private val received = Calendar.getInstance(zone).apply {
        set(2026, Calendar.OCTOBER, 9, 10, 15, 23)
        set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    @Test fun parsesTodayAtTime() {
        assertEquals(at(9, 16, 0), DeadlineParser.parse("Registration closes today at 4 PM", received, zone))
    }

    @Test fun parsesTimeBeforeTomorrow() {
        assertEquals(at(10, 9, 30), DeadlineParser.parse("Please submit by 9:30 am tomorrow", received, zone))
    }

    @Test fun handlesNoonAndMidnight() {
        assertEquals(at(10, 0, 0), DeadlineParser.parse("tomorrow at 12 am", received, zone))
        assertEquals(at(9, 12, 0), DeadlineParser.parse("today 12 pm", received, zone))
    }

    @Test fun refusesVagueOrInvalidDeadlines() {
        assertNull(DeadlineParser.parse("Please finish soon", received, zone))
        assertNull(DeadlineParser.parse("today at 17 pm", received, zone))
        assertNull(DeadlineParser.parse("by 4 PM", received, zone))
    }

    private fun at(day: Int, hour: Int, minute: Int) = Calendar.getInstance(zone).apply {
        set(2026, Calendar.OCTOBER, day, hour, minute, 0)
        set(Calendar.MILLISECOND, 0)
    }.timeInMillis
}
