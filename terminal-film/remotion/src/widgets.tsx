import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, clamp01} from './components';

/** 底部字幕：必须在 Sequence 之外渲染（使用绝对时间） */
export const Subtitles: React.FC<{
  narration: {id: string; text: string; start: number; end: number}[];
}> = ({narration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const active = narration.find((n) => t >= n.start - 0.05 && t <= n.end + 0.18);
  if (!active) return null;
  const opacity = interpolate(
    t,
    [active.start - 0.05, active.start + 0.12, active.end, active.end + 0.18],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 150,
        left: 70,
        right: 70,
        textAlign: 'center',
        opacity,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          fontFamily: '"Microsoft YaHei", sans-serif',
          fontSize: 44,
          fontWeight: 500,
          color: '#D9E2DE',
          lineHeight: 1.45,
          textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.8)',
          background: 'rgba(0,0,0,0.35)',
          padding: '10px 26px',
          borderRadius: 8,
        }}
      >
        {active.text}
      </div>
    </div>
  );
};

/** CRT 扫描线 + 暗角（全片叠层） */
export const Scanlines: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 4px)',
        pointerEvents: 'none',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

/** 实验评价条（SEG003 生长 / SEG004 复用已填满态后淡出）
 *  base：生长动画开始的相对秒（animate=true 时有效） */
export const EvaluationBars: React.FC<{
  t: number;
  animate: boolean;
  base?: number;
  opacity?: number;
}> = ({t, animate, base = 9.9, opacity = 1}) => {
  const pA = animate ? clamp01((t - base) / 1.3) : 1;
  let pB = animate ? clamp01((t - base - 0.25) / 1.55) : 1;
  if (animate && pB > 0.92) pB = 0.92 + 0.08 * clamp01((t - (base + 1.6)) / 0.25); // 轻微过冲回弹
  const doneA = !animate || pA >= 1;
  const doneB = !animate || t >= base + 1.85;
  const showVal = (done: boolean) => (done ? 1 : 0);

  const bar = (
    y: number,
    prog: number,
    target: number,
    fill: string,
    val: string,
    valColor: string,
    glowOn: boolean,
    done: boolean
  ) => (
    <div style={{position: 'absolute', left: 120, top: y, width: 840}}>
      <div
        style={{
          position: 'relative',
          height: 52,
          borderRadius: 6,
          background: 'rgba(154,165,161,0.10)',
          border: '1px solid rgba(154,165,161,0.28)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${prog * target * 100}%`,
            background: fill,
            boxShadow: glowOn ? `0 0 30px ${fill}` : 'none',
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${prog * target * 100}% + 16px)`,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            fontFamily: MONO,
            fontSize: 34,
            fontWeight: 700,
            color: valColor,
            opacity: showVal(done),
            textShadow: `0 0 14px ${valColor}`,
          }}
        >
          {val}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1075,
          textAlign: 'center',
          fontFamily: '"Microsoft YaHei", sans-serif',
          fontSize: 34,
          color: C.dim,
          letterSpacing: 6,
        }}
      >
        小组评价
      </div>
      {bar(1210, pA, 0.3, '#5E8C6F', '3/10', '#8FB59E', false, doneA)}
      {bar(1370, pB, 0.8, C.primary, '8/10', C.primary, true, doneB)}
    </div>
  );
};
