package com.unreadproblem.classifier

object NotificationTextNormalizer {
    private val contentFree = Regex(
        "^(?:\\d+\\s+new messages?|new messages?|checking for new messages|whatsapp)$",
        RegexOption.IGNORE_CASE,
    )

    fun select(expanded: String?, text: String?, lines: List<String?>?): String? {
        val candidates = listOfNotNull(
            expanded.clean(),
            lines?.mapNotNull { it.clean() }?.distinct()?.joinToString("\n")?.clean(),
            text.clean(),
        )
        return candidates.firstOrNull { !contentFree.matches(it) }?.take(8_000)
    }

    private fun String?.clean(): String? = this
        ?.replace('\u0000', ' ')
        ?.lines()
        ?.map { it.trim().replace(Regex("[ \\t]+"), " ") }
        ?.filter(String::isNotBlank)
        ?.joinToString("\n")
        ?.takeIf(String::isNotBlank)
}
