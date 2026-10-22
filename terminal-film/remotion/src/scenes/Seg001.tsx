import {AbsoluteFill, interpolate} from 'remotion';
import {C, CodeColumn, Cursor, MONO, clamp01, easeOut, glow, typedCount, useT} from '../components';

/** SEG001（0-15s）钩子 + 核心定义 */
export const Seg001: React.FC = () => {
  const t = useT();

  // --- 背景代码流：0-7.5s 缓速，随后加速铺满，9.3s 后虚化退场 ---
  const accel = easeOut(clamp01((t - 7.5) / 1.6));
  const speed = 26 + 380 * accel;
  const codeOpacity =
    t < 7.5 ? 0.16 : t < 9.3 ? 0.16 + 0.22 * accel : Math.max(0.07, 0.38 - (t - 9.3) * 0.25);

  // --- 打字机："你为它吃过多少苦？" ---
  const Q = '你为它吃过多少苦？';
  const qStart = 3.5;
  const qInterval = 0.22;
  const qN = typedCount(t, qStart, qInterval, Q.length);
  const qVisible = qN > 0;
  const qFade =
    t < 7.2 ? 1 : t < 7.6 ? interpolate(t, [7.2, 7.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;

  // --- 高亮定义句 ---
  const hlIn = easeOut(clamp01((t - 9.0) / 0.5));
  const HL = '付出越多，越容易高估价值';

  // --- 右侧价值估值条（5 级跳升） ---
  const fill = clamp01((t - 11.5) / 1.75);
  const flicker =
    t > 13.35 && t < 14.0 ? (Math.sin(t * 60) > 0 ? 1 : 0.55) * clamp01((t - 13.35) / 0.3) : t >= 14.0 ? 1 : 0;
  const barGlow = flicker;

  // --- 过曝转场 ---
  const whiteOut = interpolate(t, [13.9, 14.8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 470}}>
        <CodeColumn t={t} speed={speed} opacity={codeOpacity} color={accel > 0.3 ? C.primary : undefined} />
      </div>

      {/* 中央光标 / 打字机 */}
      <div
        style={{
          position: 'absolute',
          top: 830,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 62,
          color: '#E8EFEB',
          opacity: qFade,
        }}
      >
        {qVisible ? (
          <span style={{textShadow: glow(C.primary, 16, 0.35)}}>
            {Q.slice(0, qN)}
            <Cursor t={t} size={62} />
          </span>
        ) : (
          <Cursor t={t} size={62} />
        )}
      </div>

      {/* 高亮定义句 */}
      <div
        style={{
          position: 'absolute',
          top: 860,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: '"Microsoft YaHei", sans-serif',
          fontWeight: 700,
          fontSize: 64,
          color: C.primary,
          opacity: hlIn,
          transform: `translateY(${(1 - hlIn) * 16}px)`,
          textShadow: glow(C.primary, 30, 0.7),
        }}
      >
        {HL}
      </div>

      {/* 右侧价值估值条 */}
      <div style={{position: 'absolute', left: 940, top: 430, opacity: clamp01((t - 11.3) / 0.3)}}>
        <div
          style={{
            position: 'absolute',
            left: -60,
            top: -56,
            width: 200,
            textAlign: 'center',
            fontFamily: '"Microsoft YaHei", sans-serif',
            fontSize: 26,
            color: C.dim,
            letterSpacing: 4,
          }}
        >
          价值估值
        </div>
        {/* 轨道 */}
        <div
          style={{
            position: 'relative',
            width: 16,
            height: 1000,
            background: 'rgba(154,165,161,0.12)',
            border: '1px solid rgba(154,165,161,0.3)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: `${fill * 100}%`,
              background: C.primary,
              boxShadow: `0 0 ${34 + barGlow * 40}px ${C.primary}`,
              opacity: 1 - flicker * 0.4,
            }}
          />
        </div>
        {/* 刻度与痛苦符号 */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((lv) => {
          const on = fill >= lv - 0.001;
          return (
            <div key={lv} style={{position: 'absolute', left: 26, top: 1000 * (1 - lv) - 18}}>
              <div
                style={{
                  position: 'absolute',
                  left: -26,
                  top: 8,
                  width: 24,
                  height: 2,
                  background: on ? C.primary : 'rgba(154,165,161,0.3)',
                }}
              />
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 30,
                  color: on ? C.primary : C.muted,
                  opacity: on ? 1 : 0.5,
                  textShadow: on ? glow(C.primary, 12, 0.7) : 'none',
                  lineHeight: 1,
                }}
              >
                ×
              </div>
            </div>
          );
        })}
      </div>

      {/* 过曝泛白（衔接 SEG002） */}
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: whiteOut}} />
    </AbsoluteFill>
  );
};
