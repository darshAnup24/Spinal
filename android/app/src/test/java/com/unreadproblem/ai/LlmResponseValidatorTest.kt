package com.unreadproblem.ai

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertNotNull
import org.junit.Test

class LlmResponseValidatorTest {
    @Test fun acceptsJsonWrappedByModelText() {
        val parsed = LlmResponseValidator.classification(
            "result: {\"priority\":\"medium\",\"action_required\":true,\"deadline_text\":null,\"reason\":\"Direct request but no time limit\"}",
        )
        assertNotNull(parsed)
        assertEquals("MEDIUM", parsed!!.getString("priority"))
    }

    @Test fun rejectsUnknownPriority() {
        assertNull(LlmResponseValidator.classification(
            "{\"priority\":\"CRITICAL\",\"action_required\":true,\"deadline_text\":null,\"reason\":\"x\"}",
        ))
    }

    @Test fun rejectsStringBoolean() {
        assertNull(LlmResponseValidator.classification(
            "{\"priority\":\"HIGH\",\"action_required\":\"yes\",\"deadline_text\":null,\"reason\":\"x\"}",
        ))
    }

    @Test fun rejectsMissingDeadlineFieldAndMalformedJson() {
        assertNull(LlmResponseValidator.classification(
            "{\"priority\":\"LOW\",\"action_required\":false,\"reason\":\"x\"}",
        ))
        assertNull(LlmResponseValidator.classification("not json"))
    }
}
