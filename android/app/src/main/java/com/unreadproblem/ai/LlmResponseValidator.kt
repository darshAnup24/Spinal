package com.unreadproblem.ai

import org.json.JSONObject

object LlmResponseValidator {
    fun classification(output: String): JSONObject? = try {
        if (output.length > 4_000) return null
        val start = output.indexOf('{')
        val end = output.lastIndexOf('}')
        if (start < 0 || end <= start) return null
        val json = JSONObject(output.substring(start, end + 1))
        val priority = json.optString("priority").uppercase()
        val reason = json.optString("reason").trim()
        if (priority !in setOf("HIGH", "MEDIUM", "LOW")) return null
        if (reason.isBlank() || reason.length > 240) return null
        if (!json.has("action_required") || json.opt("action_required") !is Boolean) return null
        if (!json.has("deadline_text")) return null
        val deadline = json.opt("deadline_text")
        if (deadline != JSONObject.NULL && deadline !is String) return null
        json.apply { put("priority", priority); put("reason", reason) }
    } catch (_: Exception) { null }
}
