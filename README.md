# The Unread Problem

The Unread Problem is a private, offline-first notification triage concept. This repository contains both the Android/iOS application source and a standalone web demo.

## Build the project

There are two independent build targets in this repository:

- **Web demo:** Vite + React in `web/`; this is the only target deployed to Vercel.
- **Native app:** React Native, Android, and iOS files at the repository root.

### Build the web demo

Use Node.js 20.19 or newer:

```bash
cd web
npm ci
npm run typecheck
npm run build
```

The production files are written to `web/dist/` and can be tested locally with:

```bash
npm run preview
```

### Build the Android app

Use Node.js 22.11 or newer, an installed Android SDK, and a configured `ANDROID_HOME`:

```bash
npm ci
npx react-native start
```

In a second terminal, install and run the debug app on an emulator or connected device:

```bash
npm run android
```

To create a debug APK without launching the Metro server:

```bash
cd android
./gradlew assembleDebug
```

The APK is generated under `android/app/build/outputs/apk/debug/`.

### Build the iOS app

iOS builds require macOS with Xcode and CocoaPods. From the repository root:

```bash
npm ci
cd ios
pod install
cd ..
npm run ios
```

The native project uses local Android storage and simulated/on-device processing. The optional model download uses one HTTPS request to the configured public Hugging Face model artifact; no backend service or environment variables are required for a local build.

## How the AI works

The project is intentionally **local-first and rules-first**. It does not send notification text to a cloud AI service.

### Native processing pipeline

1. **Capture:** Android's `NotificationListenerService` accepts notifications from `com.whatsapp` only. Expanded text, text lines, and MessagingStyle content are normalized into one message record. Empty or content-free notifications are ignored.
2. **Persist:** Captured messages are written to the local Room database. Stable notification content is deduplicated, and message processing happens off the Android main thread.
3. **Rules classification:** The deterministic classifier scores urgency, deadlines, action language, important contexts, greetings, negation, and quoted content. It produces `HIGH`, `MEDIUM`, or `LOW` priority, a score, a reason, and an action/deadline result.
4. **Selective model use:** Clear rule results stay rules-only. Only ambiguous messages are sent to the optional local LiteRT-LM model. The model receives bounded message context and cannot replace a clear rule result.
5. **Validation and fallback:** Model output must be valid, bounded classification JSON. Missing, incompatible, timed-out, malformed, or failed inference preserves the original rules result. The model is downloaded only when the user explicitly requests it.
6. **Actions and reminders:** Extracted action items are stored locally. Only explicit `today` or `tomorrow` phrases with a 12-hour clock time can create reminders; vague dates are left for user review.
7. **Summaries:** Briefs and chat answers are generated from the local message and action records. Native event updates keep the React Native UI synchronized with database changes.

### Why the hybrid design matters

The app combines deterministic rules-based processing with a local LiteRT-LM instead of sending every notification to a remote AI service. This gives the project practical advantages:

- **Privacy by design:** Notification text, classification context, summaries, and history questions stay on the device during normal use. There is no cloud database or cloud LLM.
- **Reliable baseline:** Rules classify every message immediately, even when no model is installed, the phone is offline, or model inference fails.
- **Efficient AI usage:** Only ambiguous notifications use the local LLM, reducing latency, memory pressure, battery use, and unnecessary model calls.
- **Explainable decisions:** Every priority has a score and reason from the rules pipeline, making the result easier to inspect than a black-box label.
- **Graceful degradation:** A corrupt, incompatible, slow, or unavailable model cannot erase a valid rules result or block notification capture.
- **Safety-first reminders:** The app does not turn vague AI date text into alarms. Only conservative, explicit date-and-time patterns can schedule a reminder.
- **Offline capability:** After the optional model is downloaded, classification, summaries, and local history queries can run without an internet connection.
- **Measurable quality:** Synthetic labelled notifications can evaluate priority precision/recall, action extraction, deadline false positives, latency, RAM, and battery impact.

This architecture is designed for trust: fast deterministic behavior handles the obvious cases, while the local LLM adds context only where it provides value.

### Web demo behavior

The `web/` application is a browser demonstration of the product flow. It uses mock messages and actions, deterministic keyword-based responses, and simulated setup/model states. It does not perform real notification capture or remote AI inference. The UI's `HYBRID` state represents the native architecture, but a compatible `.litertlm` model must be installed on a real Android device before native model inference can be evaluated.

### Privacy and evaluation boundaries

- Message content stays on-device in the intended native architecture; release builds do not require network access.
- The optional model download is the one exception: it downloads the selected public 284 MB LiteRT-LM artifact over HTTPS, then stores it app-private. Inference and notification processing remain on-device.
- The system classifies notifications, not complete WhatsApp history, so missing, grouped, hidden-preview, or suppressed notifications can reduce accuracy.
- AI quality should be measured with synthetic labelled messages for priority precision/recall, action extraction, deadline false positives, latency, memory, and battery use.
- A successful web build or Android unit test does not prove real-device model quality, notification-listener reliability, or alarm delivery. Those require physical-device testing and a compatible model file.

## Deploy the web demo to Vercel

The Vercel deployment uses only the `web/` directory. The native Android and iOS projects are not part of the web build and do not need to be installed or configured in Vercel.

### Vercel dashboard settings

Create a new Vercel project from this repository and use these settings:

- **Root Directory:** `web`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci`
- **Node.js Version:** `20.x` or newer

No environment variables are required. The demo uses local simulated data and has no backend or cloud LLM dependency.

`web/vercel.json` rewrites application routes to `index.html`, so direct navigation and refreshes work for paths such as `/setup`, `/app`, `/app/chat`, and `/app/system`.

### Deploy with the Vercel CLI

```bash
cd web
npm ci
npm run build
npx vercel --prod
```

When prompted by the CLI, link the project to the Vercel project that uses `web` as its root directory. For repeat deployments, connect the Git repository in Vercel so pushes to the selected production branch deploy automatically.

### Local web development

Requirements: Node.js 20.19 or newer and npm.

```bash
cd web
npm ci
npm run dev       # http://localhost:5174
npm run typecheck
npm run build     # creates dist
npm run preview   # serves the production build locally
```

The committed `web/package-lock.json` is the source of truth for reproducible installs. Keep it updated whenever dependencies in `web/package.json` change.

## Native application patch

The remainder of this document describes the React Native and Kotlin MVP patch. It is separate from the Vercel website deployment.

This is a source patch for a generated React Native CLI Android project. It is not a complete generated React Native repository: merge the files into your own `npx @react-native-community/cli init UnreadProblem` project, preserving the template's Gradle/React Native configuration.

## Scope
- Personal WhatsApp notification capture (`com.whatsapp` only)
- Room local storage
- Immediate rules-first classification, optional on-device LiteRT-LM enhancement
- Local conversation summaries/action extraction through the same on-device model
- Local reminders using AlarmManager + notification channel
- React Native bridge and starter dashboard
- No server, cloud LLM, or network permission required for runtime processing

## Important limitations
- Android exposes notification content only; this is not a WhatsApp chat-history API and does not capture every message reliably.
- LiteRT-LM requires a compatible `.litertlm` model file that you obtain separately and copy to the app's private files directory as `models/model.litertlm`. Do not ship a large model inside the APK by default. This patch falls back to rules when no model is installed.
- Deadline extraction is intentionally conservative. Only unambiguous relative phrases with a clock time are scheduled automatically. Other dates should be reviewed by the user.
- Exact alarms require user-granted `SCHEDULE_EXACT_ALARM` access on supported Android versions. If unavailable, the scheduler falls back to an inexact alarm.
- Validate the code against the Kotlin, AGP, and React Native versions generated in your project. Native API compatibility can differ between templates.

## Merge steps
1. Create a React Native CLI project.
2. Copy `android/app/src/main/java/com/unreadproblem` into the matching namespace folder (change package declarations if needed).
3. Merge manifest entries from `docs/AndroidManifest-additions.xml` into your manifest.
4. Add dependencies from `docs/gradle-dependencies.gradle` and configure KAPT/KSP according to your template. This patch uses KAPT for Room.
5. Register `UnreadProblemPackage` in `MainApplication.kt`.
6. Copy `src/`, `App.tsx`, `assets/`, and `react-native.config.js` into your project.
7. Link the bundled UI fonts: `npx react-native-asset` (registers the JetBrains Mono / Pixelify Sans TTFs used by the theme).
8. Build and test on a real Android device. Enable notification access from the app's settings card.
9. For LLM inference, install a compatible LiteRT-LM model file at `filesDir/models/model.litertlm`. No model is downloaded automatically.

## Security
The captured content is sensitive. Keep logs free of message text, add an in-app retention control before production, and do not add cloud sync without explicit opt-in. Android app-private storage is not the same as an encrypted database; use SQLCipher or encrypt sensitive fields if your threat model requires at-rest encryption against device-level extraction.

## Design system
The mobile UI mirrors the shared design language (see `src/theme/index.ts`): true-void surfaces
(`#04050a`), hairline edges, bone-white text, a mono/pixel font pairing (JetBrains Mono +
Pixelify Sans) and the magenta dither accent. Priority maps to the status voices:
`HIGH → weak`, `MEDIUM → pivot`, `LOW → strong`.

## Web interface (demo)
`web/` is a standalone Vite + React + Tailwind v4 site that reproduces the same screens for
showing the product flow in a browser. It is UI-only with simulated data — no backend — and is
ready to deploy on Vercel:

```bash
cd web
npm install
npm run dev      # http://localhost:5174
npm run build    # outputs web/dist for Vercel
```

On Vercel, set the project root to `web` (framework preset: Vite). `vercel.json` rewrites all
routes to `index.html`.
