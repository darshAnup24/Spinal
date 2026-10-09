package com.unreadproblem.classifier

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MessageClassifierTest {
    @Test fun greetingIsClearLow() {
        val result = MessageClassifier.classify("Thanks!")
        assertEquals("LOW", result.priority)
        assertFalse(result.ambiguous)
    }

    @Test fun explicitUrgentActionIsClearHigh() {
        val result = MessageClassifier.classify("Urgent: submit placement registration by tomorrow")
        assertEquals("HIGH", result.priority)
        assertTrue(result.actionRequired)
        assertFalse(result.ambiguous)
    }

    @Test fun aSingleActionSignalRequestsModelReview() {
        val result = MessageClassifier.classify("Please send the notes")
        assertEquals("MEDIUM", result.priority)
        assertTrue(result.ambiguous)
    }

    @Test fun negationDoesNotBecomeUrgent() {
        val result = MessageClassifier.classify("Do not submit this; it is not required")
        assertEquals("LOW", result.priority)
        assertFalse(result.actionRequired)
    }

    @Test fun negationInOneClauseDoesNotSuppressARealLaterDeadline() {
        val result = MessageClassifier.classify("The deadline is not tomorrow; submit today at 4 pm")
        assertEquals("HIGH", result.priority)
        assertTrue(result.actionRequired)
        assertTrue(result.ambiguous)
    }

    @Test fun importantScheduleChangeIsAmbiguousWithoutUrgency() {
        val result = MessageClassifier.classify("The interview was rescheduled")
        assertEquals("MEDIUM", result.priority)
        assertTrue(result.ambiguous)
    }
}
