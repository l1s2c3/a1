// 由 tools/beat_grid.py 实测得出（112.85 BPM，4/4）
export const FPS = 30;
export const BPM = 112.85;
export const BEAT = 0.5317;
export const BAR = BEAT * 4;
export const T0 = 0.054;
export const ORIGIN_SEC = 0; // 音乐从哪里开始用

export const beatTime = (k: number) => T0 + BEAT * k;
export const beatFrame = (k: number) => Math.round(beatTime(k) * FPS);

/** 第 k 拍落在第几帧 */
export const BEAT_FRAMES = Array.from({length: 40}, (_, k) => beatFrame(k));

/** 重拍（每小节第 1 拍）：k = 2, 6, 10, 14, 18 … */
export const isDownbeat = (k: number) => k % 4 === 2;
export const DOWNBEAT_FRAMES = Array.from({length: 40}, (_, k) => k)
  .filter(isDownbeat)
  .map(beatFrame);
