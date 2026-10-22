import {useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';

export const C = timeline.theme;

export const MONO =
  '"Cascadia Code", "JetBrains Mono", Consolas, "Microsoft YaHei", "Courier New", monospace';

/** 当前 Sequence 内的相对秒 */
export const useT = (): number => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

/** 绝对秒（必须在 Sequence 之外使用） */
export const useAbsT = (): number => useT();

export const blinkOn = (t: number, period = 1.06, duty = 0.55): boolean =>
  (t % period) < period * duty;

export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

export const easeOut = (x: number): number => 1 - Math.pow(1 - clamp01(x), 3);

// ---------- 确定性伪代码内容（禁 Math.random，保证逐帧稳定） ----------
let _seed = 20261021;
const rnd = (): number => {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
};
const CODE_CHARS = '01<>{}[]=+-*/;:$.#%&|~^abcefx';
const makeLine = (n: number): string =>
  Array.from({length: n}, () => CODE_CHARS[Math.floor(rnd() * CODE_CHARS.length)]).join('');
export const CODE_LINES: string[] = Array.from({length: 48}, () =>
  makeLine(8 + Math.floor(rnd() * 30))
);

/** 向上滚动的代码流（循环） */
export const CodeColumn: React.FC<{
  t: number;
  speed: number;
  opacity: number;
  lineHeight?: number;
  fontSize?: number;
  color?: string;
  width?: number;
  left?: number;
}> = ({t, speed, opacity, lineHeight = 44, fontSize = 26, color, width = 1080, left = 0}) => {
  const n = CODE_LINES.length;
  const total = n * lineHeight;
  const y = -((t * speed) % total);
  const col = color ?? C.muted;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        width,
        overflow: 'hidden',
        opacity,
        fontFamily: MONO,
        fontSize,
        color: col,
        lineHeight: `${lineHeight}px`,
        whiteSpace: 'pre',
      }}
    >
      <div style={{transform: `translateY(${y}px)`}}>
        {[...CODE_LINES, ...CODE_LINES].map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
};

/** 终端光标（青绿色块，匀速闪烁） */
export const Cursor: React.FC<{t: number; size?: number; color?: string}> = ({
  t,
  size = 40,
  color,
}) => (
  <div
    style={{
      display: 'inline-block',
      width: size * 0.52,
      height: size * 1.05,
      backgroundColor: blinkOn(t) ? (color ?? C.primary) : 'transparent',
      boxShadow: blinkOn(t) ? `0 0 ${size * 0.5}px ${(color ?? C.primary) + '99'}` : 'none',
      verticalAlign: 'text-bottom',
      marginLeft: size * 0.12,
    }}
  />
);

/** 打字机文本：t 为相对秒；返回已打出的字符数与是否完结 */
export const typedCount = (t: number, start: number, interval: number, len: number): number =>
  Math.max(0, Math.min(len, Math.floor((t - start) / interval + 1e-6)));

/** 发光文字 */
export const glow = (color: string, r = 22, a = 0.6): string =>
  `0 0 ${r}px ${color}${Math.round(a * 255).toString(16).padStart(2, '0')}`;

/** 警告三角（纯 CSS，不依赖 emoji 字体） */
export const WarningIcon: React.FC<{size?: number; color?: string; t?: number}> = ({
  size = 84,
  color = C.red,
  t = 1,
}) => {
  const on = t === undefined ? true : blinkOn(t, 0.62, 0.6);
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size * 0.87}px solid ${color}`,
        opacity: on ? 1 : 0.15,
        filter: `drop-shadow(0 0 ${size / 4}px ${color})`,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -size * 0.09,
          top: size * 0.22,
          color: '#000',
          fontWeight: 700,
          fontSize: size * 0.5,
          lineHeight: 1,
        }}
      >
        !
      </div>
    </div>
  );
};
