# The Unread Problem — React Native + Kotlin MVP patch

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
