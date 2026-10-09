package com.unreadproblem.classifier

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

class HybridClassifierTest {
    @Test fun clearRulesResultNeverRequestsModel() {
        val rules = MessageClassifier.classify("Urgent: submit registration by tomorrow")
        assertFalse(HybridClassifier.shouldUseModel(rules, true))
    }

    @Test fun ambiguousResultRequestsOnlyAnInstalledModel() {
        val rules = MessageClassifier.classify("Please send the notes")
        assertTrue(HybridClassifier.shouldUseModel(rules, true))
        assertFalse(HybridClassifier.shouldUseModel(rules, false))
    }

    @Test fun missingOrFailedModelPreservesExactRulesResult() {
        val rules = MessageClassifier.classify("Please send the notes")
        assertSame(rules, HybridClassifier.merge(rules, null))
    }

    @Test fun validatedModelCanRefineAmbiguousResult() {
        val rules = MessageClassifier.classify("Please send the notes")
        val model = JSONObject("""{"priority":"LOW","action_required":false,"deadline_text":null,"reason":"Request is directed to someone else"}""")
        val merged = HybridClassifier.merge(rules, model)
        assertEquals("LOW", merged.priority)
        assertFalse(merged.actionRequired)
        assertFalse(merged.ambiguous)
        assertTrue(merged.reason.startsWith("Local model:"))
    }
}
