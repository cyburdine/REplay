import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const FPS = 30;
export const HERO_DURATION_FRAMES = 240; // 8s loop
// Composition pixel size. Kept moderate because we display at ~1300px CSS
// — rendering much larger forces the GPU to push pixels for nothing while
// the big blur() filters (below) scale super-linearly with surface area.
export const HERO_SIZE = 1200;
// The icon's pixel size in the composition is held constant so the triangle
// stays the same visual size as the canvas (and surrounding orb) doubles.
const ICON_PX = 300;

// Brand palette — kept in sync with tailwind.config.ts → aurora.*
const C_PINK = "rgba(255, 93, 200, 1)";
const C_VIOLET = "rgba(160, 90, 255, 1)";
const C_BLUE = "rgba(93, 139, 255, 1)";

// Beat: every 30 frames (2 beats/sec). A single 0..1 ramp per beat that decays.
function beatPulse(frame: number, beatLen = 30, attack = 4) {
  const phase = frame % beatLen;
  if (phase < attack) return phase / attack;
  return Math.max(0, 1 - (phase - attack) / (beatLen - attack));
}

// Deterministic pseudo-random in [0,1)
const rand = (i: number, seed = 1) => {
  const x = Math.sin(i * 9301 + seed * 49297) * 43758.5453;
  return x - Math.floor(x);
};

export const HeroIconComposition: React.FC<{ iconSrc?: string }> = ({
  iconSrc = "/app-icon.png",
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames; // 0..1 across loop

  const cx = width / 2;
  const cy = height / 2;

  // Slow base rotation for the whole field.
  const fieldRot = (frame / durationInFrames) * 360;

  // Icon breathes on the beat.
  const beat = beatPulse(frame, 30, 5);
  const iconScale = 1 + beat * 0.06;
  const iconGlow = 0.55 + beat * 0.35;

  // Emit a pulse ring every 30 frames; track up to 6 in flight. Absolute
  // pixel radii (not a HERO_SIZE ratio) so growing the canvas adds padding
  // around the content rather than scaling the rings themselves.
  const rings = Array.from({ length: 6 }, (_, i) => {
    const age = (frame - i * 30 - 1) % 180; // each lives 180f (6s)
    if (age < 0) return null;
    const lifeT = age / 180;
    const radius = interpolate(lifeT, [0, 1], [200, 590]);
    const opacity = interpolate(lifeT, [0, 0.15, 1], [0, 0.55, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const stroke = interpolate(lifeT, [0, 1], [2, 0.4]);
    return { age, radius, opacity, stroke };
  });

  // 3 orbital layers — absolute pixel radii so the orbits stay the same
  // distance from the icon regardless of HERO_SIZE.
  const orbits = [
    { count: 14, radius: 320, speed: 1.0, tilt: 0.35, tint: C_PINK, size: 10, blur: 12, seed: 11 },
    { count: 20, radius: 410, speed: -0.65, tilt: 0.55, tint: C_VIOLET, size: 8, blur: 16, seed: 23 },
    { count: 24, radius: 500, speed: 0.45, tilt: 0.18, tint: C_BLUE, size: 6, blur: 20, seed: 41 },
  ];

  // Two light shafts sweeping around the icon like a club rig.
  const shaftAngles = [
    (frame / durationInFrames) * 360 + 0,
    (frame / durationInFrames) * 360 + 180,
  ];

  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "visible" }}>
      {/* Slow-rotating conic aurora halo — absolute pixel size */}
      <div
        style={{
          position: "absolute",
          left: cx - 520,
          top: cy - 520,
          width: 1040,
          height: 1040,
          borderRadius: "50%",
          background: `conic-gradient(from ${fieldRot}deg, ${C_PINK}, ${C_VIOLET}, ${C_BLUE}, ${C_PINK})`,
          filter: "blur(96px)",
          opacity: 0.85,
          mixBlendMode: "screen",
        }}
      />

      {/* Soft inner radial glow that pulses with the beat. Blur radius is
          held constant — animating filter:blur(Npx) regenerates the blur
          buffer every frame, which is one of the most expensive paint ops.
          We get the same "swell" feel from opacity + transform: scale, both
          of which are composite-only. */}
      <div
        style={{
          position: "absolute",
          left: cx - 400,
          top: cy - 400,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 50%, ${C_PINK} 0%, ${C_VIOLET} 35%, ${C_BLUE} 60%, transparent 78%)`,
          filter: "blur(70px)",
          opacity: 0.4 + beat * 0.35,
          mixBlendMode: "screen",
          transform: `translate3d(0,0,0) scale(${1 + beat * 0.08})`,
          willChange: "opacity, transform",
        }}
      />

      {/* Sweeping light shafts (godrays) */}
      {shaftAngles.map((deg, i) => {
        const len = 760;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              width: len,
              height: 56,
              transform: `translate(-2%, -50%) rotate(${deg}deg)`,
              transformOrigin: "0% 50%",
              background: `linear-gradient(90deg, ${C_PINK}cc 0%, transparent 70%)`,
              filter: "blur(10px)",
              mixBlendMode: "screen",
              opacity: 0.45,
            }}
          />
        );
      })}

      {/* Pulse rings emanating from the icon on every beat */}
      {rings.map((r, i) =>
        r == null ? null : (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - r.radius,
              top: cy - r.radius,
              width: r.radius * 2,
              height: r.radius * 2,
              borderRadius: "50%",
              border: `${r.stroke}px solid rgba(255, 255, 255, ${r.opacity})`,
              boxShadow: `0 0 24px rgba(255,93,200,${r.opacity * 0.5})`,
              mixBlendMode: "screen",
            }}
          />
        )
      )}

      {/* Orbital particle field — 3 layers at different radii/speeds.
          Each particle is anchored at (cx, cy) with constant left/top and
          a constant size; the per-frame motion goes through transform:
          translate3d() + scale(). That keeps every frame in the GPU
          composite path (no layout, no paint), where previously the
          left/top updates were forcing layout for ~60 nodes every frame.
          will-change: transform promotes each to its own layer. */}
      {orbits.map((o, layer) =>
        Array.from({ length: o.count }, (_, i) => {
          const base = (i / o.count) * Math.PI * 2 + rand(i, o.seed) * 0.4;
          const angle = base + (frame / FPS) * o.speed;
          const x = Math.cos(angle) * o.radius;
          const y = Math.sin(angle) * o.radius * o.tilt;
          const depth = (Math.sin(angle) + 1) / 2; // 0 (back) → 1 (front)
          const scale = 0.4 + depth * 0.9;
          const opacity = 0.2 + depth * 0.8;
          return (
            <div
              key={`l${layer}-${i}`}
              style={{
                position: "absolute",
                left: cx,
                top: cy,
                width: o.size,
                height: o.size,
                marginLeft: -o.size / 2,
                marginTop: -o.size / 2,
                borderRadius: "50%",
                background: o.tint,
                // Box-shadow blur radius is constant — varying it per frame
                // re-rasterizes the shadow every frame. Depth is conveyed
                // through scale + opacity instead.
                boxShadow: `0 0 ${o.blur}px ${o.tint}`,
                opacity,
                mixBlendMode: "screen",
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                willChange: "transform, opacity",
              }}
            />
          );
        })
      )}

      {/* A separate pulsing glow disc behind the icon. Cheaper than
          animating a drop-shadow filter on the icon itself: this is a
          radial gradient whose opacity & scale we animate (both
          composite-only). */}
      <div
        style={{
          position: "absolute",
          left: cx - ICON_PX / 2,
          top: cy - ICON_PX / 2,
          width: ICON_PX,
          height: ICON_PX,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,93,200,0.85) 0%, rgba(160,90,255,0.45) 45%, transparent 70%)",
          filter: "blur(28px)",
          opacity: iconGlow,
          mixBlendMode: "screen",
          transform: `translate3d(0,0,0) scale(${1 + beat * 0.18})`,
          willChange: "opacity, transform",
          zIndex: 199,
        }}
      />

      {/* The icon — pinned to a constant pixel size so it stays the same
          visual size as the surrounding canvas grows. A single fixed
          drop-shadow keeps the glow look without forcing the filter to
          re-rasterize every frame; the breathing comes from transform. */}
      <div
        style={{
          position: "absolute",
          left: cx - ICON_PX / 2,
          top: cy - ICON_PX / 2,
          width: ICON_PX,
          height: ICON_PX,
          transform: `translate3d(0,0,0) scale(${iconScale})`,
          filter: "drop-shadow(0 0 28px rgba(255,93,200,0.55))",
          willChange: "transform",
          zIndex: 200,
        }}
      >
        <Img
          src={iconSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* Used to silence unused-var warnings if width/height/t/durationInFrames go unused */}
      <span style={{ display: "none" }}>{t.toFixed(0)}</span>
    </AbsoluteFill>
  );
};
