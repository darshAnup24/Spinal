# Reconstruction Prompt: The Unread Problem

Use this prompt with an AI coding agent to recreate the project from an empty directory. Build the project completely, not as a mockup or a partial scaffold. The result must be a working React Native mobile app with an Android native notification pipeline and a standalone web demo that can deploy to Vercel.

## Role and working rules

You are a senior React Native, Android/Kotlin, TypeScript, and frontend engineer. Work in small verified steps.

- Inspect the generated React Native template before replacing files.
- Preserve the React Native CLI architecture. Do not convert the project to Expo.
- Use the exact dependency versions listed below unless a version is demonstrably incompatible with the installed toolchain.
- Do not invent APIs, claim device behavior without testing, or hide build failures.
- After every meaningful implementation slice, run the narrowest relevant test or build.
- Keep secrets, private notification text, model files, generated APKs, and machine-specific paths out of git.
- Do not add a backend, analytics, cloud LLM, or notification upload. The only runtime network request allowed is the explicit HTTPS download of the configured LiteRT-LM model.
- Do not use hardcoded fake messages, fake actions, fake summaries, or fake model results in the production mobile app or web demo. Empty states must be honest. Data must come from the local database, user input, or the actual native bridge.

## Product

The product is **The Unread Problem**, a private offline-first notification triage assistant. It reads only notification text already exposed by Android, prioritizes what needs attention, extracts conservative action items, and provides local summaries. Its primary source is personal WhatsApp notifications from package `com.whatsapp`.

The product must communicate these boundaries clearly:

- Notification access is not WhatsApp chat-history access and cannot capture every message.
- Captured text is sensitive and remains on-device.
- Rules classify every message first.
- An optional local LiteRT-LM model is used only for ambiguous messages.
- Missing or failed model inference always falls back to the rules result.
- The web app is a real UI shell backed by local browser storage and user-created data, not a fake live AI service.

## Required repository layout

Create this structure, keeping native and web dependencies separate:

```text
.
├── App.tsx
├── app.json
├── index.js
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── jest.config.js
├── src/
│   ├── components/
│   ├── native/UnreadProblem.ts
│   ├── screens/
│   └── theme/index.ts
├── __tests__/
├── android/
│   └── app/src/main/java/com/unreadproblem/
│       ├── UnreadProblemModule.kt
│       ├── UnreadProblemPackage.kt
│       ├── WhatsAppNotificationListener.kt
│       ├── ai/
│       ├── data/
│       └── reminders/
├── ios/
└── web/
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── vite.config.ts
    ├── vercel.json
    └── src/
        ├── App.tsx
        ├── components/
        ├── lib/
        ├── pages/
        └── state/
```

## Native stack

Initialize a React Native CLI project named `UnreadProblem` with:

- Node.js `>=22.11.0`
- React Native `0.87.1`
- React `19.2.3`
- TypeScript
- Android Gradle Plugin `9.2.1`
- Gradle `9.4.1`
- Kotlin `2.2.0`
- compile/target SDK `36`
- minimum SDK `24`
- Hermes enabled
- New Architecture enabled
- package and namespace `com.unreadproblem`
- `react-native-safe-area-context` `^5.5.2`

Add Room `2.8.4`, `kotlinx-coroutines-android` `1.10.2`, `androidx.core:core-ktx:1.17.0`, and LiteRT-LM `0.16.1`. Keep LiteRT-LM pinned; do not use `latest.release`.

Register `UnreadProblemPackage` in the generated `MainApplication.kt`. Native methods exposed to JavaScript must use valid React Native `@ReactMethod` signatures: Promise-based methods return Kotlin `Unit` and do background work inside a coroutine; never return a coroutine `Job` from an expression-body method.

## Native data flow

Implement this end-to-end pipeline:

1. `WhatsAppNotificationListener` accepts only `com.whatsapp` notifications.
2. Normalize normal text, expanded text, text lines, MessagingStyle messages, grouped notifications, and updated notifications.
3. Drop content-free notifications and deduplicate stable notification content.
4. Process off the main thread and persist messages in Room.
5. Run deterministic rules classification before any model call.
6. Classify priority as `HIGH`, `MEDIUM`, or `LOW`, with score, reason, action state, and optional deadline.
7. Detect urgency, explicit requests, deadlines, important contexts, greetings, quoted text, negation by clause, and ambiguity.
8. Send only ambiguous cases to local LiteRT-LM with bounded context and a strict timeout.
9. Validate model output as bounded JSON with valid priority, boolean action state, valid deadline type, short reason, and safe total size.
10. Preserve the rules result on absent, corrupt, incompatible, timed-out, malformed, or failed model inference.
11. Store messages, action items, model/processing versions, reminders, and statuses in Room.
12. Schedule reminders only for explicit `today` or `tomorrow` plus a 12-hour clock time. Never trust free-form model deadline text for alarms.
13. Reschedule reminders after reboot, time changes, and timezone changes. Fall back to inexact alarms when exact-alarm access is unavailable.
14. Emit `UnreadProblemMessagesChanged` when database-backed message state changes while React Native is active.

## Required native bridge

Expose a typed `src/native/UnreadProblem.ts` API for:

- opening notification-listener settings;
- checking notification access;
- opening exact-alarm settings;
- checking notification permission;
- checking model status;
- reading recent messages and open actions;
- getting a conversation summary and today's summary;
- asking a question about local history;
- starting voice input;
- acknowledging messages;
- changing action status;
- snoozing, cancelling, and acknowledging reminders;
- deleting all local data.

Reject failed calls with stable error codes. Do not expose raw database objects without a TypeScript type.

## Mobile UI

Build a usable mobile dashboard, not a marketing page:

- private/offline status header;
- today's summary with a truthful empty state;
- priority triage queue for captured notifications;
- action/todo list with category and status controls;
- conversation detail and local summary;
- history question input and voice input;
- system screen for notification access, model status, permissions, and data deletion;
- loading, error, no-data, permission-denied, and model-unavailable states.

Use the existing visual direction: true-void surfaces, hairline borders, bone-white text, JetBrains Mono plus Pixelify Sans, and restrained magenta accent. Keep touch targets accessible and avoid inline styles where the project lint rule disallows them.

## Web demo

Create `web/` as an independent Vite + React + TypeScript + Tailwind v4 app. Use:

- React `19`
- React Router `7`
- Framer Motion
- lucide-react
- class-variance-authority, clsx, and tailwind-merge
- JetBrains Mono and Pixelify Sans from `@fontsource`
- Vite and `@vitejs/plugin-react`

The web app must not contain hardcoded fixture messages or pretend that a model is installed. Implement a small local data repository using browser `localStorage` (or IndexedDB when data size requires it) with:

- empty initial state;
- user-entered/imported notification records;
- locally persisted action status and setup state;
- reset/delete-all controls;
- deterministic rules-only classification for browser data;
- clear text stating that real Android capture and LiteRT-LM inference require the native app.

The browser UI should include welcome/setup, how-it-works, triage, chat/history, and system pages. Chat answers must be generated only from the locally stored records and must say when no local record supports an answer. Do not fabricate summaries for missing conversations.

Configure:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --noEmit",
    "preview": "vite preview"
  }
}
```

Set `web/vercel.json` to rewrite all application routes to `/index.html`. Vercel must use `web` as the root directory, `npm ci` as install command, `npm run build` as build command, and `dist` as output directory. No environment variables are required.

## Security requirements

- Add `INTERNET` only because the user-triggered model download requires HTTPS. Never upload notifications or model prompts.
- Do not log notification text, model prompts, model output, or personal identifiers.
- Do not commit `.litertlm` model files, secrets, private test fixtures, APKs, `node_modules`, build directories, or local SDK/JDK paths.
- Keep all evaluation fixtures synthetic and manually labelled.
- Document that app-private Room storage is not field-level encryption.
- Add confirmation before destructive local-data deletion.

## Tests and acceptance checks

Add focused tests for:

- notification text normalization;
- package filtering;
- duplicate handling;
- rules classification and ambiguity routing;
- negation and quoted content;
- model response validation;
- conservative deadline parsing;
- Room acknowledgement and reminder state;
- web repository persistence and reset behavior;
- empty-state and no-fabrication chat behavior.

Before declaring the project complete, run:

```bash
# root native project
npm ci
npm run lint
npm test -- --runInBand
cd android
./gradlew :app:testDebugUnitTest :app:compileDebugKotlin :app:assembleDebug

# web project
cd ../web
npm ci
npm run typecheck
npm run build
```

When a physical Android device is available, also verify USB debugging, notification-listener access, normal/expanded/MessagingStyle notifications, duplicate updates, process restart, reboot reminder rescheduling, exact-alarm fallback, permission denial, airplane-mode model behavior, corrupt-model fallback, and no repeated alert after acknowledgement.

Do not say the AI model works on-device until a compatible `.litertlm` file has run successfully on a physical arm64 Android device. Report unverified behavior explicitly.

## Delivery order

Implement in this order:

1. Generate and verify the native React Native shell.
2. Add the Android manifest, package registration, Room schema, and notification listener.
3. Add deterministic classification and tests.
4. Add reminders and their tests.
5. Add the optional validated LiteRT-LM path and fallback tests.
6. Add the typed native bridge and mobile screens.
7. Build the web app on the same domain model using local persistence and no fixtures.
8. Run all checks, build the Android APK, and verify Vercel's web build.
9. Update `README.md` with exact commands, limitations, and unverified device checks.

The final result must be a real, privacy-preserving local notification triage project with honest empty states, reproducible builds, no hardcoded runtime data, and clear separation between the native app and the Vercel web demo.
