import {AbsoluteFill, interpolate} from 'remotion';
import {C, CODE_LINES, MONO, WarningIcon, clamp01, easeOut, glow, typedCount, useT} from '../components';

/** SEG002（15-30.1s）底层逻辑：认知失调 → 大脑合理化 */
export const Seg002: React.FC = () => {
  const t = useT();

  // --- 白色过曝收缩退场 ---
  const r = interpolate(t, [0, 0.6], [150, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- 警告阶段 4.5-7.0：抖动 + 面板互挤 + 报错条纹 ---
  const alert = t >= 4.5 && t <= 7.0;
  const push = 14 * clamp01((t - 4.5) / 1.2);
  const shakeX = alert ? 6 * Math.sin(t * 47) : 0;
  const shakeY = alert ? 4 * Math.sin(t * 31) : 0;
  const stripeOp = alert ? 0.45 + 0.35 * Math.sin(t * 24) : 0;

  // 警告三角出现/退场
  const warnOp =
    t < 4.3 ? 0 : t < 4.7 ? (t - 4.3) / 0.4 : t <= 7.0 ? 1 : t < 7.4 ? 1 - (t - 7.0) / 0.4 : 0;

  // --- 认知失调 打字 ---
  const CD = '认知失调';
  const cdN = typedCount(t, 9.0, 0.3, CD.length);

  // --- 右面板改写：删除线 → 结果：值得 ---
  const strikeW = easeOut(clamp01((t - 11.0) / 0.35));
  const oldFade = t < 11.3 ? 1 : t < 11.6 ? interpolate(t, [11.3, 11.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const RW = '结果：值得';
  const rwN = typedCount(t, 11.6, 0.18, RW.length);

  // --- 绿化确认 ---
  const greenAmt = easeOut(clamp01((t - 13.0) / 0.7));
  const okIn = easeOut(clamp01((t - 13.2) / 0.5));

  const panelIn = easeOut(clamp01((t - 0.3) / 0.6));

  const Panel: React.FC<{
    x: number;
    baseColor: string;
    label: React.ReactNode;
  }> = ({x, baseColor, label}) => (
    <div style={{position: 'absolute', left: x, top: 700, width: 430, height: 720, transform: `translateX(${x < 540 ? push : -push}px)`}}>
      {/* 边框（原色 → 绿色交叉淡入） */}
      <div style={{position: 'absolute', inset: 0, border: `2px solid ${baseColor}`, borderRadius: 10, opacity: 1 - greenAmt}} />
      <div style={{position: 'absolute', inset: 0, border: `2px solid ${C.primary}`, borderRadius: 10, opacity: greenAmt, boxShadow: greenAmt > 0.5 ? glow(C.primary, 24, 0.4) : 'none'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 10, background: `linear-gradient(180deg, ${baseColor}10, transparent 40%)`}} />
      {/* 内部代码行 */}
      <div style={{position: 'absolute', left: 26, right: 26, top: 90, fontFamily: MONO, fontSize: 22, lineHeight: '40px', color: C.dim, opacity: 0.32, whiteSpace: 'pre', overflow: 'hidden'}}>
        {CODE_LINES.slice(x < 540 ? 0 : 12, x < 540 ? 11 : 23).join('\n')}
      </div>
      {label}
    </div>
  );

  const pillBase: React.CSSProperties = {
    position: 'absolute',
    top: -28,
    left: 24,
    padding: '10px 22px',
    borderRadius: 6,
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: 34,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <div style={{transform: `translate(${shakeX}px, ${shakeY}px)`, opacity: panelIn}}>
        {/* 左面板：付出 */}
        <Panel
          x={70}
          baseColor={C.red}
          label={
            <div style={{...pillBase, background: 'rgba(255,59,78,0.12)', border: `1.5px solid ${C.red}`, color: C.red}}>
              付出：很多
            </div>
          }
        />
        {/* 右面板：结果（改写） */}
        <Panel
          x={580}
          baseColor="#9AA5A1"
          label={
            <div style={{position: 'absolute', top: -28, left: 24}}>
              <div style={{...pillBase, position: 'relative', left: 0, top: 0, background: 'rgba(154,165,161,0.10)', border: '1.5px solid #9AA5A1', color: '#C4CDC9', opacity: oldFade}}>
                结果：一般
                {/* 删除线 */}
                <div style={{position: 'absolute', left: -6, top: '50%', height: 3, width: `${strikeW * 110}%`, background: C.red, boxShadow: glow(C.red, 10, 0.6)}} />
              </div>
              <div style={{...pillBase, position: 'relative', left: 0, top: 0, marginTop: -62, background: 'rgba(0,255,156,0.10)', border: `1.5px solid ${C.primary}`, color: C.primary, opacity: rwN > 0 ? 1 : 0, textShadow: glow(C.primary, 12, 0.5)}}>
                {RW.slice(0, rwN)}
                {rwN < RW.length ? <span style={{opacity: 0.9}}>▏</span> : null}
              </div>
            </div>
          }
        />

        {/* 报错条纹（内缘） */}
        <div style={{position: 'absolute', left: 500 - push, top: 700, width: 14, height: 720, background: 'repeating-linear-gradient(45deg, rgba(255,59,78,0.9) 0 6px, transparent 6px 13px)', opacity: stripeOp}} />
        <div style={{position: 'absolute', left: 566 + push, top: 700, width: 14, height: 720, background: 'repeating-linear-gradient(-45deg, rgba(255,59,78,0.9) 0 6px, transparent 6px 13px)', opacity: stripeOp}} />

        {/* 警告三角（4.3s 淡入，7.0s 后淡出） */}
        <div style={{position: 'absolute', left: 540 - 42, top: 960, opacity: warnOp}}>
          <WarningIcon size={84} t={t} />
        </div>

        {/* 认知失调 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 500,
            textAlign: 'center',
            fontFamily: '"Microsoft YaHei", sans-serif',
            fontWeight: 700,
            fontSize: 76,
            color: C.primary,
            textShadow: glow(C.primary, 34, 0.75),
            opacity: cdN > 0 ? 1 : 0,
          }}
        >
          {CD.slice(0, cdN)}
          {cdN < CD.length ? <span style={{opacity: 0.85}}>▏</span> : null}
        </div>

        {/* 矛盾已消除 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1520,
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: 36,
            color: C.primary,
            textShadow: glow(C.primary, 16, 0.5),
            opacity: okIn,
            transform: `translateY(${(1 - okIn) * 12}px)`,
          }}
        >
          ✓ 矛盾已消除
        </div>
      </div>

      {/* 白色过曝层（收缩 revealing 下方内容） */}
      <AbsoluteFill style={{backgroundColor: '#fff', clipPath: `circle(${r}% at 50% 46%)`}} />
    </AbsoluteFill>
  );
};
