import {AbsoluteFill, interpolate} from 'remotion';
import {C, Cursor, MONO, clamp01, easeOut, glow, typedCount, useT} from '../components';
import {EvaluationBars} from '../widgets';

/** SEG004（45.1-53s）启示落版 */
export const Seg004: React.FC = () => {
  const t = useT();

  // --- 评价条淡出 ---
  const barsOp = t < 1.3 ? 1 - easeOut(clamp01(t / 1.3)) : 0;

  // --- 红色警告行 ---
  const WARN = '警告：艰难不等于有价值';
  const warnN = typedCount(t, 0.25, 0.13, WARN.length);
  const warnDone = warnN >= WARN.length;

  // --- 双行命令 ---
  const L1 = '付出：多少';
  const L2 = '价值：几何';
  const twoStart = 2.7;
  const l1N = typedCount(t, twoStart, 0.09, L1.length);
  const l2N = typedCount(t, twoStart + 0.15, 0.09, L2.length);
  const twoOp = t < 3.9 ? 1 : t < 4.35 ? interpolate(t, [3.9, 4.35], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;

  // --- 落版金句 ---
  const FINAL = '把付出和价值，分开算';
  const finIn = easeOut(clamp01((t - 3.95) / 0.55));

  // --- 全片淡出至黑 ---
  const fadeOut = interpolate(t, [6.4, 7.8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      {/* 承接上段的评价条，淡出 */}
      <EvaluationBars t={t} animate={false} opacity={barsOp} />

      {/* 红色警告 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 770,
          textAlign: 'center',
          fontFamily: '"Microsoft YaHei", sans-serif',
          fontWeight: 600,
          fontSize: 52,
          color: C.red,
          textShadow: glow(C.red, 22, 0.6),
          opacity: warnN > 0 ? 1 : 0,
        }}
      >
        <span style={{color: C.dim, fontFamily: MONO, fontWeight: 400}}>$ </span>
        {WARN.slice(0, warnN)}
        <Cursor t={t} size={52} color={C.red} />
      </div>

      {/* 双行命令 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1130,
          display: 'flex',
          justifyContent: 'center',
          gap: 110,
          fontFamily: MONO,
          fontSize: 48,
          color: C.primary,
          opacity: t >= twoStart ? twoOp : 0,
        }}
      >
        <div style={{textShadow: glow(C.primary, 14, 0.45)}}>
          {L1.slice(0, l1N)}
          {l1N < L1.length ? <span>▏</span> : null}
        </div>
        <div style={{textShadow: glow(C.primary, 14, 0.45)}}>
          {L2.slice(0, l2N)}
          {l2N < L2.length ? <span>▏</span> : null}
        </div>
      </div>

      {/* 落版金句 */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 950,
          textAlign: 'center',
          fontFamily: '"Microsoft YaHei", sans-serif',
          fontWeight: 700,
          fontSize: 60,
          color: C.primary,
          textShadow: glow(C.primary, 32, 0.7),
          opacity: finIn,
          transform: `translateY(${(1 - finIn) * 14}px)`,
        }}
      >
        {FINAL}
        {finIn >= 1 ? <Cursor t={t} size={60} /> : null}
      </div>

      {/* 淡出至黑 */}
      <AbsoluteFill style={{backgroundColor: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
