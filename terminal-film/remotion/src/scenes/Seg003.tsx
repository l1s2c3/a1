import {C, CODE_LINES, MONO, WarningIcon, clamp01, easeOut, glow, typedCount, useT} from '../components';
import {EvaluationBars} from '../widgets';

/** SEG003（30.1-45.1s）经典实验：1959 Aronson & Mills 双栏对比 */
export const Seg003: React.FC = () => {
  const t = useT();

  // --- 顶部标题打字机 ---
  const TITLE = '1959 Aronson & Mills';
  const titleN = typedCount(t, 0.4, 0.085, TITLE.length);

  // --- 双栏面板 ---
  const panelIn = easeOut(clamp01((t - 4.3) / 0.6));
  const panelOut = t < 9.7 ? 1 : t < 10.2 ? 1 - easeOut(clamp01((t - 9.7) / 0.5)) : 0;
  const panelY = 20 * (1 - panelIn) + 40 * (1 - panelOut);

  // --- B 组警报闪烁两次 ---
  const alertWin = (t > 5.5 && t < 5.95) || (t > 6.45 && t < 6.9);

  const GroupPanel: React.FC<{
    x: number;
    color: string;
    header: string;
    sub: string;
    warn?: boolean;
  }> = ({x, color, header, sub, warn}) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 800,
        width: 440,
        height: 620,
        border: `2px solid ${color}`,
        borderRadius: 10,
        background: `linear-gradient(180deg, ${color}12, transparent 45%)`,
        boxShadow: `0 0 26px ${color}44`,
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', left: 26, top: 26, right: 26, fontFamily: '"Microsoft YaHei", sans-serif', fontSize: 40, fontWeight: 700, color, textShadow: glow(color, 14, 0.5)}}>
        {header}
      </div>
      <div style={{position: 'absolute', left: 26, top: 92, right: 26, fontFamily: '"Microsoft YaHei", sans-serif', fontSize: 27, color: C.dim}}>
        {sub}
      </div>
      <div style={{position: 'absolute', left: 26, right: 26, top: 160, fontFamily: MONO, fontSize: 21, lineHeight: '38px', color: C.dim, opacity: 0.3, whiteSpace: 'pre', overflow: 'hidden'}}>
        {CODE_LINES.slice(x < 400 ? 24 : 4, x < 400 ? 35 : 15).join('\n')}
      </div>
      {warn ? (
        <div style={{position: 'absolute', right: 30, top: 150, opacity: alertWin ? 1 : 0}}>
          <WarningIcon size={56} t={t} />
        </div>
      ) : null}
    </div>
  );

  const barsIn = easeOut(clamp01((t - 9.9) / 0.4));

  return (
    <div style={{backgroundColor: C.bg, position: 'absolute', inset: 0}}>
      {/* 标题 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 400,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 56,
          fontWeight: 700,
          color: '#E8EFEB',
          textShadow: glow(C.primary, 18, 0.4),
        }}
      >
        {TITLE.slice(0, titleN)}
        {titleN < TITLE.length ? <span style={{color: C.primary}}>▏</span> : null}
      </div>

      {/* 双栏 */}
      <div style={{opacity: panelIn * panelOut, transform: `translateY(${panelY}px)`}}>
        <GroupPanel x={70} color={C.primary} header="Ａ组·轻松提问" sub="简单问答即可加入" />
        <GroupPanel x={570} color={C.red} header="Ｂ组·羞耻测试" sub="尴尬难堪的入会门槛" warn />
      </div>

      {/* 评价条（A 3/10 vs B 8/10） */}
      <div style={{opacity: barsIn, transform: `translateY(${(1 - barsIn) * 30}px)`}}>
        <EvaluationBars t={t} animate base={9.9} />
      </div>
    </div>
  );
};
