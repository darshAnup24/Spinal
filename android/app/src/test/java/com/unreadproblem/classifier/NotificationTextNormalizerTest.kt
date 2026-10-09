package com.unreadproblem.classifier

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class NotificationTextNormalizerTest {
    @Test fun expandedTextWins() {
        assertEquals("Full expanded content", NotificationTextNormalizer.select(" Full   expanded content ", "short", null))
    }

    @Test fun distinctLinesSupportGroupedNotifications() {
        assertEquals("Alice: first\nBob: second", NotificationTextNormalizer.select(null, "2 new messages", listOf("Alice: first", "Alice: first", "Bob: second")))
    }

    @Test fun contentFreeSummariesAreDropped() {
        assertNull(NotificationTextNormalizer.select(null, "3 new messages", null))
        assertNull(NotificationTextNormalizer.select(null, "Checking for new messages", null))
    }

    @Test fun nullCharactersAndWhitespaceAreNormalized() {
        assertEquals("Submit now", NotificationTextNormalizer.select(null, " Submit\u0000   now ", null))
    }
}
