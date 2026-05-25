import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Visualizer } from "./Visualizer";
import { TRACKS } from "./tracks";

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export type REplayCompositionProps = {
  trackIndex: number;
  progress: number; // 0..1
  showPlaylist: boolean;
  isPlaying: boolean;
  [key: string]: unknown;
};

export const REplayComposition: React.FC<REplayCompositionProps> = ({
  trackIndex,
  progress,
  showPlaylist,
  isPlaying,
}) => {
  const frame = useCurrentFrame();
  const track = TRACKS[trackIndex] ?? TRACKS[0];

  const elapsedSeconds = progress * track.durationSeconds;
  const totalSeconds = track.durationSeconds;

  // Window subtle breathing scale (very gentle)
  const breathe = 1 + Math.sin(frame / 60) * 0.003;

  const winW = 920;
  const winH = 540;
  const playlistW = 320;

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: winW,
            height: winH,
            transform: `scale(${breathe})`,
            transformOrigin: "center",
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            background:
              "linear-gradient(180deg, rgba(28,28,38,0.96) 0%, rgba(14,14,22,0.96) 100%)",
            boxShadow:
              "0 60px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              height: 40,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: 12,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.0))",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", gap: 7 }}>
              <span style={dot("#ff5f57")} />
              <span style={dot("#febc2e")} />
              <span style={dot("#28c840")} />
            </div>
            <img
              src="/logo-wordmark.png"
              alt="RE:play"
              style={{
                height: 18,
                width: "auto",
                opacity: 0.9,
                display: "block",
              }}
            />
          </div>

          {/* Body */}
          <div style={{ display: "flex", height: winH - 40 - 72, position: "relative" }}>
            {/* Playlist drawer (slides in from the right edge) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: playlistW,
                zIndex: 2,
                transform: `translateX(${showPlaylist ? 0 : playlistW}px)`,
                transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
                background:
                  "linear-gradient(180deg, rgba(22,22,30,0.96), rgba(14,14,22,0.96))",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                padding: "20px 0",
                overflow: "hidden",
                boxShadow: showPlaylist
                  ? "-8px 0 24px rgba(0,0,0,0.35)"
                  : "none",
              }}
            >
              <div
                style={{
                  padding: "0 18px 12px",
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Playlist · {TRACKS.length} tracks
              </div>
              {TRACKS.map((t, i) => {
                const active = i === trackIndex;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 18px",
                      background: active
                        ? "linear-gradient(90deg, rgba(120,170,255,0.18), rgba(120,170,255,0))"
                        : "transparent",
                      borderLeft: active
                        ? "2px solid #a0d8ff"
                        : "2px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        color: active ? "#a0d8ff" : "rgba(255,255,255,0.3)",
                        fontSize: 10,
                        textAlign: "center",
                      }}
                    >
                      {active ? "▶" : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: active ? 600 : 500,
                          color: active ? "#fff" : "rgba(255,255,255,0.78)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.45)",
                          marginTop: 1,
                        }}
                      >
                        {t.artist}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatTime(t.durationSeconds)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main visualizer pane */}
            <div
              style={{
                flex: 1,
                position: "relative",
                background:
                  "radial-gradient(circle at 50% 60%, rgba(80,100,255,0.10), transparent 70%)",
              }}
            >
              {/* Track meta */}
              <div
                style={{
                  position: "absolute",
                  top: 28,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: 6,
                  }}
                >
                  Now Playing
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>
                  {track.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    marginTop: 2,
                  }}
                >
                  {track.artist}
                </div>
              </div>

              {/* Visualizer center */}
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  right: 24,
                  top: 130,
                  bottom: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Visualizer
                  width={winW - 48}
                  height={210}
                  intensity={isPlaying ? 1 : 0.25}
                />
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 72,
              padding: "0 22px",
              display: "flex",
              alignItems: "center",
              gap: 18,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={controlBtn()}>⏮</div>
            <div style={controlBtn(true)}>{isPlaying ? "❚❚" : "▶"}</div>
            <div style={controlBtn()}>⏭</div>

            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontVariantNumeric: "tabular-nums",
                width: 38,
                textAlign: "right",
              }}
            >
              {formatTime(elapsedSeconds)}
            </div>

            <div
              style={{
                flex: 1,
                position: "relative",
                height: 3,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 999,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress * 100}%`,
                  background:
                    "linear-gradient(90deg, #a0d8ff, #ffffff)",
                  borderRadius: 999,
                  boxShadow: "0 0 8px rgba(160,216,255,0.6)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${progress * 100}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 0 10px rgba(255,255,255,0.8)",
                }}
              />
            </div>

            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontVariantNumeric: "tabular-nums",
                width: 38,
              }}
            >
              {formatTime(totalSeconds)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.85 }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>🔊</span>
              <div
                style={{
                  width: 64,
                  height: 3,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 999,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "70%",
                    height: "100%",
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

function dot(color: string): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: color,
    display: "inline-block",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
  };
}

function controlBtn(primary = false): React.CSSProperties {
  return {
    width: primary ? 38 : 30,
    height: primary ? 38 : 30,
    borderRadius: "50%",
    background: primary ? "#fff" : "rgba(255,255,255,0.10)",
    color: primary ? "#0a0a0a" : "rgba(255,255,255,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: primary ? 13 : 11,
    border: primary ? "none" : "1px solid rgba(255,255,255,0.15)",
    flex: "0 0 auto",
  };
}

