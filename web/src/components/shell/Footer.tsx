export function Footer() {
  return (
    <footer
      id="privacy"
      className="relative z-10 mx-auto mt-24 max-w-6xl border-t border-[color:var(--color-edge)] px-4 py-10 md:px-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-pixel text-xs uppercase tracking-[0.25em] text-[color:var(--color-text-mute)]">
            NO_BACKEND · MESSAGE DATA STAYS ON-DEVICE
          </div>
          <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-[color:var(--color-text-dim)]">
            This is an interactive interface preview of the Android app. Android exposes
            notification content only — this is not a WhatsApp chat-history API. Captured
            content is sensitive; production builds keep logs free of message text and offer
            in-app retention controls.
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-text-dim)]">
          the unread problem · interface demo
        </span>
      </div>
    </footer>
  );
}
