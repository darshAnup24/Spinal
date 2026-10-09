package com.unreadproblem.ai

import android.content.Context
import android.os.SystemClock
import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.json.JSONObject
import java.io.File

/** Offline LiteRT-LM adapter. The caller always retains a rules result as fallback. */
class LocalLlm(private val context: Context) {
    private var engine: Engine? = null
    private val engineMutex = Mutex()
    @Volatile private var retryAfterElapsedMs = 0L

    fun isModelInstalled(): Boolean = modelFile().isFile && modelFile().length() > 0L
    fun modelSizeBytes(): Long = modelFile().takeIf(File::isFile)?.length() ?: 0L
    fun expectedModelPath(): String = externalModelFile().absolutePath
    private fun privateModelFile() = File(File(context.filesDir, "models"), "model.litertlm")
    private fun externalModelFile(): File {
        val base = context.getExternalFilesDir(null) ?: context.filesDir
        return File(File(base, "models"), "model.litertlm")
    }
    private fun modelFile() = privateModelFile().takeIf(File::isFile) ?: externalModelFile()

    suspend fun generate(prompt: String): String? = withContext(Dispatchers.IO) {
        if (!isModelInstalled()) return@withContext null
        if (SystemClock.elapsedRealtime() < retryAfterElapsedMs) return@withContext null
        try {
            withTimeout(30_000) {
                engineMutex.withLock {
                    val active = engine ?: Engine(
                        EngineConfig(
                            modelPath = modelFile().absolutePath,
                            backend = Backend.CPU(),
                            cacheDir = context.cacheDir.absolutePath,
                        )
                    ).also { it.initialize(); engine = it }
                    active.createConversation().use { conversation ->
                        conversation.sendMessageAsync(prompt.take(10_000)).toList().joinToString("")
                    }.also { retryAfterElapsedMs = 0L }
                }
            }
        } catch (_: Throwable) {
            retryAfterElapsedMs = SystemClock.elapsedRealtime() + 5 * 60_000L
            runCatching { engine?.close() }
            engine = null
            null
        }
    }

    suspend fun summarize(messages: List<String>): String? {
        if (messages.isEmpty()) return null
        return generate("""Summarize private notifications. Do not invent facts. Use headings KEY UPDATES, ACTIONS, DEADLINES, UNRESOLVED. Say unknown when needed.
MESSAGES:
${messages.takeLast(30).joinToString("\n---\n").take(9000)}""")
    }

    suspend fun classify(text: String, recentContext: List<String> = emptyList()): JSONObject? {
        val contextBlock = recentContext.takeLast(8).joinToString("\n---\n").take(4_000)
        val output = generate("""Resolve an ambiguous notification classification. Return ONLY JSON with keys priority (HIGH, MEDIUM, or LOW), action_required (boolean), deadline_text (string or null), and reason (under 240 chars). Do not infer unstated facts or dates.
RECENT CONTEXT (may be incomplete):
$contextBlock
CURRENT MESSAGE:
${text.take(1800)}""") ?: return null
        return LlmResponseValidator.classification(output)
    }

    fun close() { engine?.close(); engine = null }
}
