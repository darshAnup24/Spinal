package com.unreadproblem.classifier

import org.json.JSONObject

object HybridClassifier {
    fun shouldUseModel(rules: Classification, modelInstalled: Boolean): Boolean =
        modelInstalled && rules.ambiguous

    /** Model JSON has already passed LlmResponseValidator. Null always means rules fallback. */
    fun merge(rules: Classification, model: JSONObject?): Classification {
        if (model == null) return rules
        val priority = model.optString("priority")
        if (priority !in setOf("HIGH", "MEDIUM", "LOW")) return rules
        val score = when (priority) {
            "HIGH" -> maxOf(rules.score, 5)
            "MEDIUM" -> maxOf(rules.score, 2)
            else -> minOf(rules.score, 1)
        }
        return Classification(
            priority = priority,
            score = score,
            reason = "Local model: ${model.optString("reason").take(240)}",
            actionRequired = model.optBoolean("action_required", rules.actionRequired),
            ambiguous = false,
        )
    }
}
