export type DemoTrack = {
  title: string;
  artist: string;
  durationFrames: number; // at 30fps
};

// 30 fps. Total ~360 frames = 12s loop. Each track ~120 frames = 4s.
export const FPS = 30;
export const TRACKS: DemoTrack[] = [
  { title: "Aurora",   artist: "Ludwig Göransson",   durationFrames: 120 },
  { title: "Time",     artist: "Pink Floyd",         durationFrames: 120 },
  { title: "Nightcall", artist: "Kavinsky",          durationFrames: 120 },
];

export const TOTAL_FRAMES = TRACKS.reduce((s, t) => s + t.durationFrames, 0);

export function trackIndexForFrame(frame: number): number {
  let acc = 0;
  for (let i = 0; i < TRACKS.length; i++) {
    acc += TRACKS[i].durationFrames;
    if (frame < acc) return i;
  }
  return TRACKS.length - 1;
}

export function frameWithinTrack(frame: number): { index: number; local: number; length: number } {
  let acc = 0;
  for (let i = 0; i < TRACKS.length; i++) {
    const len = TRACKS[i].durationFrames;
    if (frame < acc + len) {
      return { index: i, local: frame - acc, length: len };
    }
    acc += len;
  }
  const i = TRACKS.length - 1;
  return { index: i, local: TRACKS[i].durationFrames - 1, length: TRACKS[i].durationFrames };
}

export function trackStartFrame(index: number): number {
  let acc = 0;
  for (let i = 0; i < index; i++) acc += TRACKS[i].durationFrames;
  return acc;
}
