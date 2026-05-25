import { useCurrentFrame } from "remotion";

const BAR_COUNT = 64;

// Deterministic pseudo-random per bar so the spectrum is unique but stable.
function seed(i: number): number {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function barHeight(i: number, frame: number): number {
  // Multiple sine layers + bar-specific phase to simulate spectrum.
  const phase = seed(i) * Math.PI * 2;
  const freqA = 0.18 + seed(i + 1) * 0.12;
  const freqB = 0.05 + seed(i + 2) * 0.04;
  const freqC = 0.40 + seed(i + 3) * 0.10;
  const a = Math.sin(frame * freqA + phase) * 0.5 + 0.5;
  const b = Math.sin(frame * freqB + phase * 1.7) * 0.5 + 0.5;
  const c = Math.sin(frame * freqC + phase * 0.4) * 0.5 + 0.5;
  // Lower frequencies bias toward the center / left like a real spectrum.
  const positional = 1 - Math.abs(i / BAR_COUNT - 0.5) * 0.6;
  const energy = (a * 0.55 + b * 0.30 + c * 0.15) * positional;
  return Math.max(0.06, Math.min(1, energy));
}

export const Visualizer: React.FC<{ width: number; height: number; intensity?: number }> = ({
  width,
  height,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const gap = 3;
  const barWidth = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#a8e0ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5060ff" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="barGradReflect" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5060ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5060ff" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const h = barHeight(i, frame) * height * 0.85 * intensity;
        const x = i * (barWidth + gap);
        const y = height / 2 - h / 2;
        return (
          <g key={i} filter="url(#glow)">
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={Math.min(barWidth / 2, 2)}
              fill="url(#barGrad)"
            />
            <rect
              x={x}
              y={y + h}
              width={barWidth}
              height={h * 0.35}
              rx={Math.min(barWidth / 2, 2)}
              fill="url(#barGradReflect)"
              opacity={0.5}
            />
          </g>
        );
      })}
    </svg>
  );
};
