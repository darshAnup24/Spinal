package com.unreadproblem.classifier

import java.util.Locale

object CategoryClassifier {
    private val keywords: Map<String, List<Regex>> = mapOf(
        "academics" to listOf(
            Regex("""\b(assignment|homework|quiz|test|exam|thesis|research|paper|lecture|class|seminar|course|syllabus|grade|grade-point|gpa|credit|student)\b""", RegexOption.IGNORE_CASE),
            Regex("""\b(course|module|lecture|seminar|tutorial|labs?|practical)\b""", RegexOption.IGNORE_CASE)
        ),
        "placements" to listOf(
            Regex("""\b(internship|interview|offer|job|resume|cv|cooperation|placement|recruitment|job|hiring|position|salary|benefit)\b""", RegexOption.IGNORE_CASE),
            Regex("""\b(offer letter|job offer|interview scheduling|recruitment process)\b""", RegexOption.IGNORE_CASE)
        ),
        "events" to listOf(
            Regex("""\b(meeting|event|party|gathering|appointment|plan|schedule|booking|reservation|ticket|volunteer|location|venue)\b""", RegexOption.IGNORE_CASE),
            Regex("""\b(tomorrow|today|tonight) at \d{1,2}""")
        ),
        "family" to listOf(
            Regex("""\b(mom|dad|mother|father|brother|sister|child|baby|family|parent|home|visit|call)[\?\.]?""", RegexOption.IGNORE_CASE),
            Regex("""\b(birthday|anniversary|celebration|shoutout)\b""", RegexOption.IGNORE_CASE)
        )
    )

    /**
     * Classify a text snippet into one of four categories or return null for default.
     * Priority order: placements > academics > events > family
     */
    fun classify(text: String): String? {
        val upper = text.uppercase(Locale.ROOT)
        val scores = keywords.mapValues { (_, patterns) -> patternScore(upper, patterns) }
        val maxScore = scores.values.maxOrNull() ?: 0
        if (maxScore == 0) return null
        return scores.entries.sortedByDescending { it.value }.first().key
    }

    private fun patternScore(text: String, patterns: List<Regex>): Int =
        patterns.count { it.containsMatchIn(text) }

    /**
     * Merge category with action item context - prefers existing category if source is WhatsApp.
     */
    fun inferCategory(title: String, reason: String, conversation: String): String? {
        // Family messages often come from personal contacts
        if (conversation.contains(Regex("""\b(family|mom|dad|mother|father)\b""", RegexOption.IGNORE_CASE)) &&
            !title.contains(Regex("""\b(meeting|appointment|deadline)\b""", RegexOption.IGNORE_CASE))) {
            return "family"
        }
        return classify(title) ?: classify(reason)
    }
}