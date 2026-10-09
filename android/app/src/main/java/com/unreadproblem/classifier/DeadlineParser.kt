package com.unreadproblem.classifier

import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

/** Conservative parser: only today/tomorrow paired with an explicit 12-hour clock time. */
object DeadlineParser {
    private val dayFirst = Regex(
        "\\b(today|tomorrow)(?:\\s+(?:at|by))?\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)\\b",
        RegexOption.IGNORE_CASE,
    )
    private val timeFirst = Regex(
        "\\b(?:by|at)\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)\\s+(today|tomorrow)\\b",
        RegexOption.IGNORE_CASE,
    )

    fun parse(text: String, receivedAt: Long, timeZone: TimeZone = TimeZone.getDefault()): Long? {
        val dayMatch = dayFirst.find(text)
        val parts = if (dayMatch != null) {
            listOf(dayMatch.groupValues[1], dayMatch.groupValues[2], dayMatch.groupValues[3], dayMatch.groupValues[4])
        } else {
            val timeMatch = timeFirst.find(text) ?: return null
            listOf(timeMatch.groupValues[4], timeMatch.groupValues[1], timeMatch.groupValues[2], timeMatch.groupValues[3])
        }
        val day = parts[0].lowercase(Locale.ROOT)
        var hour = parts[1].toIntOrNull() ?: return null
        val minute = parts[2].ifBlank { "0" }.toIntOrNull() ?: return null
        val ampm = parts[3].lowercase(Locale.ROOT)
        if (hour !in 1..12 || minute !in 0..59) return null
        hour = when { ampm == "pm" && hour != 12 -> hour + 12; ampm == "am" && hour == 12 -> 0; else -> hour }
        return Calendar.getInstance(timeZone).apply {
            timeInMillis = receivedAt
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (day == "tomorrow") add(Calendar.DAY_OF_YEAR, 1)
        }.timeInMillis
    }
}
