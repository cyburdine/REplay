export type DemoTrack = {
  file: string;
  title: string;
  artist: string;
  durationSeconds: number;
};

export const FPS = 30;
export const TOTAL_FRAMES = 360;

export const TRACKS: DemoTrack[] = [
  {
    file: "Make You Stay - 8D_Cywren.mp3",
    title: "Make You Stay (8D)",
    artist: "Cyburdine Sound Factory (ft. Cywren)",
    durationSeconds: 207.96,
  },
  {
    file: "Skyline Pulse_8d.mp3",
    title: "Skyline Pulse (8D)",
    artist: "Infinite Volumes",
    durationSeconds: 213.96,
  },
  {
    file: "Take Me Higher_8d.mp3",
    title: "Take Me Higher (8D)",
    artist: "Infinite Volumes",
    durationSeconds: 205.8,
  },
];

export function trackSrc(t: DemoTrack): string {
  return `/demo-audio/${encodeURIComponent(t.file)}`;
}
