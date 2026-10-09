export function BackgroundLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="dither-field absolute inset-0" />
      <div className="dither-grid absolute inset-0 opacity-[0.18]" />
      <div className="scanline absolute inset-0 opacity-60" />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 50%, transparent, var(--color-void) 100%)',
        }}
      />
    </div>
  );
}
