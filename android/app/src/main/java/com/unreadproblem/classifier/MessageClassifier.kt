package com.unreadproblem.classifier

data class Classification(
    val priority: String,
    val score: Int,
    val reason: String,
    val actionRequired: Boolean,
    val ambiguous: Boolean,
)

object MessageClassifier {
    private val deadline = Regex("\\b(deadline|due date|closes? at|by (?:\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?|today|tomorrow)|today|tomorrow|tonight|EOD)\\b", RegexOption.IGNORE_CASE)
    private val urgency = Regex("\\b(urgent|asap|immediately|last chance|action required|mandatory|final reminder)\\b", RegexOption.IGNORE_CASE)
    private val actions = Regex("\\b(submit|complete|register|upload|pay|attend|reply|confirm|apply|respond|fill out|send)\\b", RegexOption.IGNORE_CASE)
    private val negation = Regex("\\b(no need to|don't|do not|not required|not due|deadline is not)\\b", RegexOption.IGNORE_CASE)
    private val greetings = Regex("^(hi|hello|hey|good morning|good night|thanks|thank you|ok|okay)[!. ]*$", RegexOption.IGNORE_CASE)
    private val importantContext = Regex("\\b(placement|internship|interview|exam(?:ination)?|meeting|registration|payment|schedule change|rescheduled|cancelled)\\b", RegexOption.IGNORE_CASE)
    private val quoted = Regex("(^|\\n)\\s*[>|“\"]")

    fun classify(text: String): Classification {
        val clean = text.trim()
        if (clean.isBlank()) return Classification("LOW", 0, "No readable content", false, false)
        if (greetings.matches(clean)) return Classification("LOW", 0, "Greeting or acknowledgement", false, false)
        val clauses = clean.split(Regex("[;.!?\\n]+")).filter(String::isNotBlank)
        val hasNegation = clauses.any(negation::containsMatchIn)
        var score = 0
        val reasons = mutableListOf<String>()
        var actionRequired = false
        clauses.filterNot(negation::containsMatchIn).forEach { clause ->
            if (deadline.containsMatchIn(clause)) { score += 3; reasons += "Possible deadline" }
            if (urgency.containsMatchIn(clause)) { score += 3; reasons += "Urgency indicator" }
            if (actions.containsMatchIn(clause)) { score += 2; actionRequired = true; reasons += "Possible action required" }
        }
        if (importantContext.containsMatchIn(clean)) { score += 2; reasons += "Important context" }
        if (hasNegation) reasons += "Negation detected"
        val priority = when { score >= 5 -> "HIGH"; score >= 2 -> "MEDIUM"; else -> "LOW" }
        val ambiguous = quoted.containsMatchIn(clean) || (hasNegation && score > 0) || score in 2..4
        return Classification(
            priority, score,
            reasons.joinToString("; ").ifBlank { "No strong urgency signal" },
            actionRequired, ambiguous,
        )
    }
}
