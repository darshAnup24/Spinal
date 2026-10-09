# Remaining Work Handoff — The Unread Problem

## Scope and ownership

Continue as the backend/native Android engineer. Do **not** modify `App.tsx`, frontend components, styling, navigation, or other UI behavior; a separate agent owns the frontend. Native bridge additions are allowed only when backend functionality needs to be exposed.

Do not claim a feature works unless its relevant check has passed. Preserve the rules-first, local-only architecture and do not add a cloud API or runtime network dependency.

## Current project baseline

- React Native CLI 0.87.1 (not Expo)
- React 19.2.3
- Android Gradle Plugin 9.2.1
- Gradle wrapper 9.4.1
- Kotlin 2.2.0
- compile SDK 36, target SDK 36, min SDK 24
- namespace/application ID: `com.unreadproblem`
- Room 2.8.4
- LiteRT-LM 0.16.1, pinned because it is built with Kotlin 2.2.x and matches this project; do not change it to `latest.release`
- Release manifest intentionally has no `INTERNET` permission. The permission exists only in `src/debug` for Metro.

## Backend work already implemented

1. A complete React Native Android scaffold now exists and the native package is registered in `MainApplication.kt`.
2. `WhatsAppNotificationListener` filters the actual package `com.whatsapp`, normalizes expanded/text-line/MessagingStyle content, drops content-free summaries, stores work off the main thread, deduplicates stable notification content, and requests listener rebind after disconnection.
3. Rules classification runs and persists before any model work.
4. `MessageClassifier` identifies deadlines, urgency, actions, important contexts, greetings, negation by clause, quoted content, and whether a result is ambiguous.
5. `HybridClassifier` sends only ambiguous results to the model. Clear LOW and clear HIGH results remain rules-only. Missing, timed-out, malformed, or failed model inference preserves the rules result.
6. LiteRT-LM runs locally on CPU with a 30-second timeout, bounded prompts/context, serialized engine access, cleanup, and a five-minute failure backoff. No model is downloaded automatically.
7. Model classification JSON is validated for priority, boolean action state, deadline field type, reason length, and total output size before use.
8. Recent same-conversation messages are supplied as bounded context for ambiguous classification.
9. Model deadline text is not trusted for alarms. `DeadlineParser` only accepts explicit `today`/`tomorrow` plus a 12-hour clock time.
10. Room stores captured messages, processing/model versions, action items, and reminders. Destructive migration fallback was removed.
11. Reminders are persisted, rescheduled after reboot/time/timezone changes, marked delivered or permission-denied, cancelled with action completion/dismissal, and support native snooze/cancel/acknowledge methods.
12. Exact alarms fall back to inexact alarms when exact-alarm access is unavailable.
13. A native event (`UnreadProblemMessagesChanged`) is emitted when database-backed message state changes while React Native is active.
14. Unit tests exist for rules, ambiguity routing, response validation, deadline parsing, and notification text normalization. Room instrumentation tests cover duplicate handling, acknowledgement, and reminder state.

## Checks already completed

- `npx tsc --noEmit`: passed before the backend-only handoff.
- `npm test -- --runInBand`: passed (1 frontend render test); frontend is now out of scope.
- `npm run lint`: no errors; six pre-existing inline-style warnings in `App.tsx`.
- `adb devices -l`: no physical device or emulator connected.
- Initial Android build did not reach project compilation because JDK 17 was absent and automatic GitHub-hosted toolchain downloads were reset by the network.

## Immediate next steps

1. Finish installing/unpacking a local JDK 17. A Corretto archive was being downloaded to `/tmp/jdk17.tar.gz`; verify it is complete before using it. Do not commit a machine-specific JDK path.
2. Run the backend unit tests and Kotlin compilation:

   ```bash
   cd android
   JAVA_HOME=<jdk-17-path> ./gradlew :app:testDebugUnitTest :app:compileDebugKotlin --stacktrace
   ```

3. Fix every compile or unit-test failure. Pay particular attention to the LiteRT-LM 0.16.1 Kotlin API, React Native event-emitter API, Room KAPT output, and Android 36 constants.
4. Run a full debug APK build:

   ```bash
   JAVA_HOME=<jdk-17-path> ./gradlew :app:assembleDebug
   ```

5. Inspect the generated Room schema under `android/app/schemas/` and commit it. Keep database version 1 until the first released schema; after release, add explicit migrations for every schema change.
6. Run connected instrumentation tests when an emulator/device is available:

   ```bash
   JAVA_HOME=<jdk-17-path> ./gradlew :app:connectedDebugAndroidTest
   ```

7. Add focused native tests if compilation exposes uncovered boundaries. Do not replace real LiteRT inference with mocked production behavior.

## Model integration still requiring real-device verification

1. Obtain a genuinely compatible compact `.litertlm` text model; do not blindly bundle or download a large model.
2. Place it at the path returned by native `getModelStatus().expectedPath`, normally the app-specific external `files/models/model.litertlm` path.
3. On at least one supported physical arm64 Android device, measure:
   - engine initialization time;
   - ambiguous-message classification latency;
   - peak RAM;
   - model size;
   - battery impact;
   - classification usefulness and deadline false-negative rate.
4. Verify airplane-mode inference and confirm no message content leaves the device.
5. Verify corrupt/incompatible model handling falls back to rules without crashing or blocking notification capture.
6. Create a small synthetic, manually labelled evaluation fixture and report HIGH-priority precision/recall. Keep all fixtures synthetic—never commit private WhatsApp content.

## Notification and reminder device tests still required

- Grant and revoke notification-listener access.
- Verify personal WhatsApp (`com.whatsapp`) capture and rejection of other packages.
- Exercise normal, expanded, MessagingStyle, grouped, updated, hidden-preview, and content-free notifications.
- Verify duplicate events do not create duplicate rows.
- Kill/restart the process and verify capture resumes.
- Reboot and verify future reminders are rescheduled.
- Test Android 13+ notification permission denial.
- Test exact-alarm allowed and denied paths.
- Test acknowledge, complete, dismiss, snooze, cancel, delete-all, and no repeated alert after acknowledgement.
- Test timezone/time changes.

## Known limitations to preserve in reporting

- Android notification access is not WhatsApp chat-history access and cannot guarantee every message.
- Hidden previews, suppressed notifications, grouped summaries, OEM restrictions, and listener downtime can remove context.
- The local model has not been benchmarked or proven on a physical device yet.
- A successful emulator/unit build does not prove reliable production alarm delivery.
- The database uses app-private Room storage but is not field-level encrypted.
- Relative deadline extraction is intentionally conservative; vague phrases such as “soon” do not create timed alarms.

## Completion criteria for the backend handoff

- Unit tests and debug compilation pass with JDK 17.
- Debug APK builds.
- Room schema is exported and reviewed.
- Physical-device notification, offline model, and reminder checks are recorded with exact results.
- Any remaining unverified behavior is clearly labelled; do not represent model inference as working until a compatible model actually runs on device.
