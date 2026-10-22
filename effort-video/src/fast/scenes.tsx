import React from 'react';
import {interpolate, spring} from 'remotion';
import {P} from '../flat/palette';
import {Bloom, Motes, Person, rnd, Room, Ticks} from '../flat/prims';
import {SCENES as FLAT} from '../flat/scenes';
import {DraftCtx} from './draftCtx';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
type S = {
  local: number;
  dur: number;
  text?: string;
  sub?: string;
  value?: number;
  mode?:
    | 'full'
    | 'empty'
    | 'top'
    | 'side'
    | 'close'
    | 'into'
    | 'focus'
    | 'wide'
    | 'left'
    | 'right'
    | 'swap'
    | 'one'
    | 'all'
    | 'ask'
    | 'show'
    | 'push'
    | 'wall'
    | 'unload'
    | 'line';
};

/**
 * 三组：从头到尾用同一套字母和颜色。
 * 筛选 → 波形 → 柱子 三场里 A/B/C 的颜色一致，观众才知道"这是同一批人"。
 * 注意：这里的门槛不是"体力上的高难度"，是**尴尬**——A 组要当众读露骨的词。
 */
const GROUPS = [
  {k: 'A', c: '#EDBE72', cx: 410, label: '读露骨词'},
  {k: 'B', c: '#B08A5E', cx: 960, label: '读普通词'},
  {k: 'C', c: '#6B5943', cx: 1510, label: '不用筛选'},
];

const Svg: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = '#08080B'}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
    <defs>
      <radialGradient id="fSoup" cx="0.5" cy="0.45" r="0.62">
        <stop offset="0%" stopColor="#E8B25E" />
        <stop offset="62%" stopColor="#C07B31" />
        <stop offset="100%" stopColor="#6E3B14" />
      </radialGradient>
      <linearGradient id="roomSide" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#000000" stopOpacity={0.62} />
        <stop offset="24%" stopColor="#000000" stopOpacity={0} />
        <stop offset="74%" stopColor="#000000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000000" stopOpacity={0.5} />
      </linearGradient>
      <radialGradient id="fVig" cx="0.5" cy="0.5" r="0.72">
        <stop offset="40%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.85} />
      </radialGradient>
      <linearGradient id="fStreak" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FFF" stopOpacity={0} />
        <stop offset="50%" stopColor="#FFF8EC" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#FFF" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="wetFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E8B15C" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#E8B15C" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="crowdSink" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#04040A" stopOpacity={0} />
        <stop offset="100%" stopColor="#04040A" stopOpacity={0.62} />
      </linearGradient>
      <linearGradient id="gateSpill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFD79A" stopOpacity={0.28} />
        <stop offset="100%" stopColor="#FFD79A" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="manyFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0A0A0F" />
        <stop offset="100%" stopColor="#060608" />
      </linearGradient>
      <linearGradient id="askBeam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFD79A" stopOpacity={0.17} />
        <stop offset="52%" stopColor="#FFD79A" stopOpacity={0.075} />
        <stop offset="100%" stopColor="#FFD79A" stopOpacity={0.015} />
      </linearGradient>
      <linearGradient id="fDeep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#040406" stopOpacity={0} />
        <stop offset="100%" stopColor="#040406" stopOpacity={0.85} />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill={bg} />
    {children}
  </svg>
);

const slamIn = (local: number, delay = 0) => {
  const p = interpolate(local, [delay, delay + 5], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 4)});
  return {scale: 2.4 - 1.4 * p, blur: (1 - p) * 34, opacity: p};
};

/* ---------------- 00 一只自己做歪的小板凳（"它"） ---------------- */
const STOOL_LEGS = [
  {t: [-200, -300], b: [-262, -12], w: 26, c: '#3D2713'},
  {t: [140, -336], b: [208, -12], w: 26, c: '#3D2713'},
  {t: [-140, -250], b: [-206, -2], w: 30, c: '#7C5331'},
  {t: [198, -286], b: [268, -62], w: 30, c: '#7C5331'},
];

const Stool: React.FC<{x: number; y: number; s?: number; opacity?: number; wob?: number}> = ({
  x,
  y,
  s = 1,
  opacity = 1,
  wob = 0,
}) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${-3 + wob})`} opacity={opacity}>
    <ellipse cx={0} cy={2} rx={272} ry={26} fill="#000" opacity={0.6} />
    {STOOL_LEGS.map((L, i) => (
      <line key={i} x1={L.t[0]} y1={L.t[1]} x2={L.b[0]} y2={L.b[1]} stroke={L.c} strokeWidth={L.w} />
    ))}
    {/* 座面：顶面 / 前沿 / 左侧厚 */}
    <path d="M-215 -320 L155 -356 L215 -300 L-155 -264 Z" fill="#A67445" />
    <path d="M-155 -264 L215 -300 L215 -270 L-155 -234 Z" fill="#5C3A20" />
    <path d="M-215 -320 L-155 -264 L-155 -234 L-215 -290 Z" fill="#7C5331" />
    {/* 顶面木纹 + 被光打亮的后沿 */}
    <path d="M-198 -308 L162 -342 M-180 -290 L176 -324" stroke="#8A5F36" strokeWidth={2.6} opacity={0.6} fill="none" />
    <path d="M-215 -320 L155 -356" stroke="#C79A67" strokeWidth={3.4} opacity={0.85} fill="none" />
    {/* 锯短了的那条腿：断口是浅色木茬 */}
    <path d="M254 -80 L282 -80 L277 -60 L259 -60 Z" fill="#C79A67" opacity={0.9} />
  </g>
);

const Ask1: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  const ignite = interpolate(local, [0, 12], [0, 1], {...clamp, easing: (x) => x * x});
  const flick = 0.9 + 0.1 * Math.sin(local / 2.6) * Math.sin(local / 6.1);
  const wob = Math.sin(local / 8.5) * 0.7;
  const floorY = 800;
  return (
    <Svg bg="#050507">
      <rect y={floorY} width={1920} height={280} fill="#07070A" />
      {draft ? <DraftWorkshop /> : null}
      <g opacity={ignite}>
        {/* 柔光锥：两层模糊叠加，边缘不出硬边 */}
        <g style={{filter: 'blur(30px)'}} opacity={flick}>
          <polygon points="872,-60 1048,-60 1360,800 560,800" fill="#FFD79A" opacity={0.09} />
          <polygon points="908,-60 1012,-60 1250,800 680,800" fill="#FFD79A" opacity={0.13} />
        </g>
        {/* 座面上的亮斑与地面光池 */}
        <ellipse cx={965} cy={470} rx={340} ry={86} fill={P.warm} opacity={0.10 * flick} style={{filter: 'blur(52px)'}} />
        <ellipse cx={960} cy={floorY + 2} rx={420} ry={56} fill={P.warm} opacity={0.12 * flick} style={{filter: 'blur(48px)'}} />
        <Stool x={960} y={floorY} s={1.28} wob={wob} />
        <Motes local={local} n={54} color="rgba(255,238,210,0.55)" />
      </g>
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 01 墙上的正字（"吃过的苦"） ---------------- */
const TALLY = (() => {
  let d = '';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 13; c++) {
      const gx = 252 + c * 112 + (r % 2) * 13;
      const gy = 204 + r * 56;
      for (let k = 0; k < 4; k++) {
        d += `M${gx + k * 16} ${gy} L${gx + k * 16 - 1.5} ${gy + 36} `;
      }
      d += `M${gx - 9} ${gy + 29} L${gx + 58} ${gy + 7} `;
    }
  }
  return d;
})();

/* ---------------- 草稿专用：正字墙的房间边界 ---------------- */
const DraftWall: React.FC = () => (
  <>
    {/* 天花板：只留一条交界，别把墙框成一块板 —— 划痕本来就该铺满整面墙 */}
    <rect width={1920} height={150} fill="#07060A" />
    <rect y={148} width={1920} height={2.5} fill="#FFD79A" opacity={0.045} />
    {/* 右上一盏壁灯：墙上有一团光，说明这面墙被打过光 */}
    <ellipse cx={1640} cy={372} rx={330} ry={270} fill="#FFC874" opacity={0.075} style={{filter: 'blur(88px)'}} />
    <ellipse cx={1640} cy={302} rx={96} ry={42} fill="#FFD79A" opacity={0.14} style={{filter: 'blur(28px)'}} />
    {/* 灯座 */}
    <rect x={1626} y={268} width={28} height={16} rx={4} fill="#241C14" opacity={0.8} style={{filter: 'blur(3px)'}} />
  </>
);

const Ask2: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  const bx = -200 + local * 7.5;
  return (
    <Svg bg="#060609">
      <DraftWall />
      <defs>
        <linearGradient id="bandGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" />
          <stop offset="30%" stopColor="#fff" />
          <stop offset="62%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <mask id="scanMask">
          <g transform={`translate(${bx},0) skewX(-11)`}>
            <rect x={0} y={0} width={620} height={1080} fill="url(#bandGrad)" />
          </g>
        </mask>
      </defs>
      <rect y={150} width={1920} height={652} fill="#0D0C10" />
      {/* 全部划痕：压到几乎看不见，只有被光扫到的才亮 */}
      <path d={TALLY} stroke="#6E5638" strokeWidth={2.8} fill="none" opacity={0.14} strokeLinecap="round" />
      <g mask="url(#scanMask)">
        <path d={TALLY} stroke={P.warm} strokeWidth={3.6} fill="none" opacity={0.95} strokeLinecap="round" />
        <Bloom blur={24} opacity={0.6}>
          <path d={TALLY} stroke={P.warm} strokeWidth={3.6} fill="none" strokeLinecap="round" />
        </Bloom>
      </g>
      {/* 踢脚线，让墙有落到地上的位置 */}
      <rect y={780} width={1920} height={22} fill="#131218" />
      <rect y={780} width={1920} height={2} fill={P.warm} opacity={0.12} />
      {/* 地面：光带在地上淌开，板凳被留在左边 */}
      <rect y={802} width={1920} height={280} fill="#050507" />
      <ellipse cx={bx + 300} cy={812} rx={540} ry={96} fill={P.warm} opacity={0.07} style={{filter: 'blur(64px)'}} />
      <ellipse cx={330} cy={800} rx={220} ry={30} fill={P.warm} opacity={0.08} style={{filter: 'blur(30px)'}} />
      <Stool x={330} y={800} s={0.55} opacity={0.95} wob={Math.sin(local / 8.5) * 0.5} />
      <Motes local={local} n={36} color="rgba(255,238,210,0.42)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 02 人群（"不是你一个人"） ---------------- */
const CROWD_ROWS = [
  {head: 786, s: 1.62, gap: 236, off: -70},
  {head: 700, s: 1.4, gap: 208, off: 60},
  {head: 638, s: 1.21, gap: 184, off: -24},
  {head: 590, s: 1.05, gap: 164, off: 92},
  {head: 552, s: 0.91, gap: 146, off: 14},
  {head: 521, s: 0.79, gap: 132, off: 72},
  {head: 495, s: 0.69, gap: 120, off: -34},
  {head: 473, s: 0.6, gap: 110, off: 44},
];

const Crowd: React.FC<S> = ({local}) => (
  <Svg bg="#050507">
    {/* 后方一盏大泛光，让所有人只剩剪影 */}
    <ellipse cx={960} cy={400} rx={900} ry={430} fill="#FFC874" opacity={0.1} style={{filter: 'blur(90px)'}} />
    <ellipse cx={960} cy={530} rx={1150} ry={260} fill="#FFB85C" opacity={0.07} style={{filter: 'blur(80px)'}} />
    <ellipse cx={960} cy={900} rx={1250} ry={210} fill="#FFB85C" opacity={0.04} style={{filter: 'blur(90px)'}} />
    {[...CROWD_ROWS].reverse().map((row, ri) => {
      const idx = CROWD_ROWS.length - 1 - ri; // 0 = 最近一排
      // 越远颜色越浅一点点（空气透视），近处最深，剪影才有层次
      const lvl = Math.round(5 + idx * 2.2);
      const fill = `rgb(${lvl},${Math.round(lvl * 0.93)},${Math.round(lvl * 0.82)})`;
      const rim = idx < 4 ? `rgba(255,216,158,${(0.22 - idx * 0.03).toFixed(3)})` : undefined;
      const count = Math.ceil(2200 / row.gap) + 1;
      return (
        <g key={row.head}>
          {Array.from({length: count}, (_, j) => {
            const jx = (rnd(j * 7 + idx * 31, 11) - 0.5) * row.gap * 0.42;
            const x = row.off - row.gap + j * row.gap + jx;
            const sc = row.s * (0.94 + rnd(j + idx * 13, 3) * 0.14);
            const lean = (rnd(j + idx * 5, 9) - 0.5) * 5;
            const fy = row.head + 186 * sc + Math.sin(local / 22 + j + idx) * 1.8;
            return (
              <Person key={j} x={x} y={fy} s={sc} color={fill} rim={rim} lean={lean} />
            );
          })}
        </g>
      );
    })}
    <rect y={820} width={1920} height={260} fill="url(#crowdSink)" />
    <Motes local={local} n={44} color="rgba(255,238,210,0.35)" />
    <rect width={1920} height={1080} fill="url(#fVig)" />
  </Svg>
);

/* ---------------- 03 1959：实验室里的两个人 ---------------- */
/** 比 Person 更像"人"的剪影：有颈、肩、腰线、双臂，近景也立得住 */
const Figure: React.FC<{
  x: number;
  y: number;
  s?: number;
  color?: string;
  rim?: string;
  lean?: number;
  pose?: 'down' | 'board';
}> = ({x, y, s = 1, color = '#050508', rim, lean = 0, pose = 'down'}) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${lean})`}>
    <g fill={color}>
      <ellipse cx={0} cy={-197} rx={24} ry={28} />
      <rect x={-10} y={-178} width={20} height={30} />
      <path d="M-48 -152 C-54 -118 -44 -66 -38 -26 L38 -26 C44 -66 54 -118 48 -152 C28 -168 -28 -168 -48 -152 Z" />
      <path d="M-46 -146 C-68 -120 -74 -86 -70 -56" stroke={color} strokeWidth={17} fill="none" strokeLinecap="round" />
      {pose === 'down' ? (
        <path d="M46 -146 C68 -120 74 -86 70 -56" stroke={color} strokeWidth={17} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M46 -148 C68 -138 74 -112 64 -84" stroke={color} strokeWidth={17} fill="none" strokeLinecap="round" />
      )}
    </g>
    {rim ? (
      <g stroke={rim} strokeWidth={2.2} fill="none" strokeLinecap="round">
        <ellipse cx={0} cy={-197} rx={24} ry={28} />
        <path d="M-48 -152 C-54 -118 -44 -66 -38 -26" />
        <path d="M48 -152 C54 -118 44 -66 38 -26" />
        <path d="M-46 -146 C-68 -120 -74 -86 -70 -56" />
      </g>
    ) : null}
  </g>
);

const Lab: React.FC<S> = ({local, mode, dur = 64}) => {
  // into：一句话一个镜头，全景起步、一镜内慢慢推到磁带机上，中途不切
  const zoom =
    mode === 'close'
      ? 2.2
      : mode === 'into'
        ? interpolate(local, [6, Math.max(24, dur - 14)], [1, 1.62], clamp)
        : 1;
  const tx = 960 - 960 * zoom;
  const ty = 540 - 555 * zoom;
  const spin = local * 1.6;
  const breath = 0.9 + 0.1 * Math.sin(local / 24);
  const vu = Array.from({length: 11}, (_, i) => 0.18 + 0.82 * Math.abs(Math.sin(local / (8 + i * 1.5) + i)));
  const DESK = 640;
  return (
    <Svg bg="#050507">
      <g transform={`translate(${tx},${ty}) scale(${zoom})`}>
        <Room cx={960} cy={330} bw={1780} bh={460} wall="#101016" floor="#08080C" ceil="#0A0A0F" side="#0B0B10" />
        {/* 后墙上的暖光：逆光一立，人自然就成了剪影 */}
        <ellipse cx={960} cy={420} rx={700} ry={340} fill="#FFC874" opacity={0.16} style={{filter: 'blur(100px)'}} />
        <ellipse cx={960} cy={530} rx={520} ry={190} fill="#FFB85C" opacity={0.13} style={{filter: 'blur(80px)'}} />
        <ellipse cx={960} cy={250} rx={300} ry={170} fill="#FFD9A0" opacity={0.1} style={{filter: 'blur(90px)'}} />
        {/* 主灯：一盏垂下的工业吊灯 */}
        <line x1={960} y1={96} x2={960} y2={148} stroke="#2A2620" strokeWidth={4} />
        <path d="M910 142 L1010 142 L992 198 L928 198 Z" fill="#26271F" />
        <ellipse cx={960} cy={198} rx={32} ry={9} fill="#FFEBC8" />
        <Bloom blur={40} opacity={0.6 * breath}>
          <ellipse cx={960} cy={198} rx={26} ry={9} fill="#FFEBC8" />
        </Bloom>
        {/* 光锥：两层模糊，边缘不出硬边 */}
        <g style={{filter: 'blur(38px)'}} opacity={0.15 * breath}>
          <polygon points="920,200 1000,200 1500,700 420,700" fill="#FFD79A" />
          <polygon points="936,200 984,200 1300,700 620,700" fill="#FFD79A" opacity={0.8} />
        </g>
        {/* 两个人：站在桌后，下半身被实验台挡住 */}
        <Figure
          x={608}
          y={724}
          s={1.82}
          color="#050508"
          lean={interpolate(local, [0, 64], [-2.6, -0.4], clamp)}
          pose="board"
        />
        <Figure
          x={1312}
          y={728}
          s={1.78}
          color="#050508"
          lean={interpolate(local, [0, 64], [2.4, 1.2], clamp)}
          pose="down"
        />
        {/* 左边的人举着的记录板 */}
        <g transform="translate(700,502) rotate(-11)">
          <rect x={0} y={0} width={66} height={90} rx={2} fill="#D3C8AE" opacity={0.85} />
          <g stroke="#8A8069" strokeWidth={2} opacity={0.5}>
            <line x1={13} y1={24} x2={53} y2={24} />
            <line x1={13} y1={40} x2={53} y2={40} />
            <line x1={13} y1={56} x2={42} y2={56} />
          </g>
        </g>
        {/* 实验台 */}
        <rect x={240} y={DESK} width={1440} height={26} fill="#2A261C" />
        <rect x={240} y={DESK} width={1440} height={6} fill="#4E4433" />
        <rect x={240} y={DESK + 26} width={1440} height={16} fill="#141319" />
        <rect x={240} y={DESK + 42} width={1440} height={414} fill="#08080D" />
        <ellipse cx={960} cy={DESK + 40} rx={520} ry={40} fill={P.warm} opacity={0.07 * breath} style={{filter: 'blur(30px)'}} />
        {/* 台面被灯打亮的一片 */}
        <ellipse cx={960} cy={DESK + 2} rx={430} ry={16} fill={P.warm} opacity={0.16 * breath} style={{filter: 'blur(18px)'}} />
        {/* 桌上的纸 */}
        <g opacity={0.5}>
          <rect x={330} y={624} width={116} height={16} fill="#B7AC94" />
          <rect x={352} y={610} width={96} height={13} fill="#A79C84" />
        </g>
        {/* 磁带机 */}
        <g>
          <rect x={806} y={470} width={308} height={170} rx={10} fill="#242320" />
          <rect x={806} y={470} width={308} height={170} rx={10} fill="none" stroke="#3F3B33" strokeWidth={2.5} />
          <rect x={806} y={470} width={308} height={24} rx={10} fill="#191815" />
          {[{cx: 884, dir: 1}, {cx: 1036, dir: -0.82}].map((r) => (
            <g key={r.cx}>
              <circle cx={r.cx} cy={546} r={44} fill="#121210" />
              <circle cx={r.cx} cy={546} r={44} fill="none" stroke="#3B372F" strokeWidth={2} />
              <g transform={`rotate(${spin * r.dir} ${r.cx} 546)`}>
                {[0, 1, 2].map((k) => {
                  const a = (k / 3) * Math.PI * 2;
                  return (
                    <line
                      key={k}
                      x1={r.cx}
                      y1={546}
                      x2={r.cx + Math.cos(a) * 36}
                      y2={546 + Math.sin(a) * 36}
                      stroke="#8A6A3C"
                      strokeWidth={4}
                      opacity={0.7}
                    />
                  );
                })}
              </g>
              <circle cx={r.cx} cy={546} r={7} fill={P.warm} opacity={0.85} />
            </g>
          ))}
          <path d="M884 592 L1036 592" stroke="#4A3C2E" strokeWidth={4} />
          {vu.map((v, i) => (
            <rect
              key={i}
              x={862 + i * 16}
              y={622 - v * 20}
              width={8}
              height={v * 20}
              fill={i > 7 ? P.mint : P.warm}
              opacity={0.5 + v * 0.4}
            />
          ))}
          <Bloom blur={44} opacity={0.12 * breath}>
            <rect x={806} y={470} width={308} height={170} fill={P.warm} />
          </Bloom>
        </g>
      </g>
      {/* 屏幕空间的一块小铭牌：这一镜要说的话变长了，画面自己把年份和人名钉住 */}
      {mode !== 'close' ? (
        <g opacity={interpolate(local, [2, 12], [0, 1], clamp)}>
          <text
            x={140}
            y={216}
            fill="rgba(255,246,230,0.40)"
            style={{fontFamily: '"Consolas", monospace', fontSize: 40, letterSpacing: 6}}
          >
            1959
          </text>
          <line x1={140} y1={238} x2={264} y2={238} stroke={P.warm} strokeWidth={2} opacity={0.42} />
          <text
            x={140}
            y={278}
            fill="rgba(255,246,230,0.24)"
            style={{fontFamily: '"Consolas", monospace', fontSize: 22, letterSpacing: 3}}
          >
            ARONSON &amp; MILLS
          </text>
        </g>
      ) : null}
      <Motes local={local} n={38} color="rgba(255,238,210,0.32)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
      {/* 特写时再压一层暗角，把注意力收到机器上 */}
      {mode === 'close' ? <rect width={1920} height={1080} fill="url(#fVig)" opacity={0.55} /> : null}
    </Svg>
  );
};

/* ---------------- 03 三种筛选条件：尴尬，不是体力活 ---------------- */
const Mic: React.FC<{x: number; y: number; s?: number; c?: string}> = ({
  x,
  y,
  s = 1,
  c = 'rgba(255,236,204,0.5)',
}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={c} strokeWidth={3} strokeLinecap="round">
    <rect x={-9} y={-28} width={18} height={30} rx={9} />
    <path d="M-16 -14 A16 16 0 0 0 16 -14" />
    <line x1={0} y1={2} x2={0} y2={15} />
    <line x1={-11} y1={15} x2={11} y2={15} />
  </g>
);

const FONT = '"Noto Sans SC", sans-serif';

/** 每个组门口挂着的那张"你要做什么才能进来"的牌子 */
const TaskCard: React.FC<{g: (typeof GROUPS)[number]}> = ({g}) => {
  const x = g.cx;
  return (
    <g>
      <rect x={x - 130} y={606} width={260} height={184} rx={10} fill="#100F14" stroke="rgba(255,236,204,0.16)" strokeWidth={2} />
      <rect x={x - 130} y={606} width={260} height={6} rx={3} fill={g.c} opacity={0.75} />
      <text x={x - 104} y={654} fill={g.c} style={{fontFamily: FONT, fontSize: 28, fontWeight: 700}}>
        {g.k} 组
      </text>
      {g.k === 'A' ? (
        <>
          <Mic x={x + 98} y={646} s={0.92} />
          <text x={x} y={700} textAnchor="middle" fill="rgba(255,246,230,0.86)" style={{fontFamily: FONT, fontSize: 32, fontWeight: 700}}>
            当众朗读
          </text>
          {/* 内容不便显示：四条涂黑的杠，正好说明它有多难开口 */}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={x - 99 + i * 68}
              y={716}
              width={54}
              height={21}
              rx={4}
              fill="#05050A"
              stroke="rgba(255,236,204,0.2)"
              strokeWidth={1.5}
            />
          ))}
          <text x={x} y={768} textAnchor="middle" fill="rgba(255,246,230,0.42)" style={{fontFamily: FONT, fontSize: 22}}>
            露骨词汇
          </text>
        </>
      ) : null}
      {g.k === 'B' ? (
        <>
          <Mic x={x + 98} y={646} s={0.92} c="rgba(255,236,204,0.34)" />
          <text x={x} y={700} textAnchor="middle" fill="rgba(255,246,230,0.86)" style={{fontFamily: FONT, fontSize: 32, fontWeight: 700}}>
            朗读
          </text>
          <text x={x} y={748} textAnchor="middle" fill="rgba(255,246,230,0.7)" style={{fontFamily: FONT, fontSize: 30}}>
            普通词语
          </text>
        </>
      ) : null}
      {g.k === 'C' ? (
        <>
          <text x={x} y={704} textAnchor="middle" fill="rgba(255,246,230,0.78)" style={{fontFamily: FONT, fontSize: 34, fontWeight: 700}}>
            直接加入
          </text>
          <g stroke="rgba(255,236,204,0.34)" strokeWidth={3} fill="none" strokeLinecap="round">
            <line x1={x - 74} y1={750} x2={x + 62} y2={750} />
            <path d={`M${x + 38} 735 L${x + 62} 750 L${x + 38} 765`} />
          </g>
        </>
      ) : null}
    </g>
  );
};

const Screening: React.FC<S> = ({local, mode = 'wide', value = 0}) => {
  const back = 710; // 后墙与地面交界
  const top = 190;
  // focus：推近某一组，把那张牌子上写什么看清楚
  const v = mode === 'focus' ? value : -1;
  const zoom = v >= 0 ? 2.05 : 1;
  const fx = v >= 0 ? GROUPS[v].cx : 960;
  const fy = v >= 0 ? 690 : 596;
  return (
    <Svg bg="#050507">
      <g transform={`translate(${960 - fx * zoom},${540 - fy * zoom}) scale(${zoom})`}>
      <Room cx={960} cy={430} bw={1700} bh={560} wall="#101015" floor="#0A0A10" ceil="#0B0B10" side="#0C0C11" />
      {GROUPS.map((g, i) => {
        const flick = 0.9 + 0.1 * Math.sin(local / 19 + i * 2.1);
        return (
          <g key={g.k}>
            {/* 门洞里的光：加入小组才有光 */}
            <rect x={g.cx - 170} y={top} width={340} height={back - top} fill={P.warm} opacity={0.88 * flick} />
            <Bloom blur={66} opacity={0.4}>
              <rect x={g.cx - 170} y={top} width={340} height={back - top} fill={P.warm} />
            </Bloom>
            {/* 光洒到门口的地上 */}
            <polygon
              points={`${g.cx - 170},${back} ${g.cx + 170},${back} ${g.cx + 300},${back + 190} ${g.cx - 300},${back + 190}`}
              fill="url(#gateSpill)"
              opacity={0.42 * flick}
            />
            {/* 门口等着进去的人 */}
            <Person x={g.cx} y={back} s={1.2} color="#08080C" rim="rgba(255,232,196,0.28)" />
            {/* A 组：屋里还坐着两个人听——"当众"这两个字要看得见 */}
            {g.k === 'A'
              ? [-124, 124].map((dx) => (
                  <Person key={dx} x={g.cx + dx} y={back - 4} s={0.52} color="#0B0B10" rim="rgba(255,232,196,0.16)" />
                ))
              : null}
            <TaskCard g={g} />
          </g>
        );
      })}
      </g>
      <Motes local={local} n={30} color="rgba(255,238,210,0.3)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 05 三段一模一样的波形 ---------------- */
/**
 * 故意画得很平：这段讨论本来就无聊。
 * 波形起伏越大越像"精彩内容"，观众反而接不上"为什么还要打分"。
 */
const WAVE = (() => {
  let d = '';
  for (let x = 0; x <= 1400; x += 3) {
    const t = x / 1400;
    const amp = 13 * (0.35 + 0.65 * Math.abs(Math.sin(t * 3.2) * Math.cos(t * 1.7)));
    const y = Math.sin(x / 13) * amp + Math.sin(x / 5.1) * amp * 0.22;
    d += x === 0 ? `M0 ${y.toFixed(1)}` : ` L${x} ${y.toFixed(1)}`;
  }
  return d;
})();

const ThreeWaves: React.FC<S> = ({local, dur = 64, mode = 'all'}) => {
  const draft = React.useContext(DraftCtx);
  const rev = interpolate(local, [4, dur - 6], [0, 1400], clamp);
  // one：只一条（"进去以后听的那段讨论"）；all：三条一模一样（"三组听的是同一段"）
  const rows =
    mode === 'one'
      ? [{k: '', c: P.warm, y: 540, t: '这段讨论'}]
      : GROUPS.map((g, i) => ({k: g.k, c: g.c, y: 372 + i * 180, t: `${g.k} 组`}));
  // all：三条先完全重合（看着就是"同一段"），再分开成三组
  const split = mode === 'all' ? interpolate(local, [2, 16], [0, 1], clamp) : 1;
  return (
    <Svg bg="#060608">
      <defs>
        <clipPath id="waveClip">
          <rect x={260} y={0} width={Math.max(0, rev)} height={1080} />
        </clipPath>
      </defs>
      {/* 屏幕上方一句话把"这是什么"钉死，别让观众猜这条线是啥 */}
      <text
        x={260}
        y={250}
        fill="rgba(255,246,230,0.30)"
        style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 27, letterSpacing: '0.1em'}}
      >
        {mode === 'one' ? '小组讨论录音 · 示意' : '三组听到的，内容完全相同'}
      </text>
      {rows.map((r, i) => {
        const y = 540 + (r.y - 540) * split;
        return (
          <g key={r.k || i}>
            <line x1={260} y1={y} x2={1660} y2={y} stroke="rgba(255,236,204,0.09)" strokeWidth={2} />
            <text
              x={206}
              y={y + 10}
              textAnchor="end"
              fill={r.c}
              opacity={0.72}
              style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: 2}}
            >
              {r.t}
            </text>
          </g>
        );
      })}
      <g clipPath="url(#waveClip)">
        {rows.map((r, i) => {
          const y = 540 + (r.y - 540) * split;
          return (
            <g key={r.k || i} transform={`translate(260,${y})`}>
              <path d={WAVE} stroke={r.c} strokeWidth={3.2} fill="none" opacity={0.9} />
              <path d={WAVE} stroke={r.c} strokeWidth={11} fill="none" opacity={0.22} style={{filter: 'blur(9px)'}} />
            </g>
          );
        })}
      </g>
      {/* 扫过去的播放头 */}
      <g opacity={rev > 2 ? 1 : 0}>
        <line x1={260 + rev} y1={290} x2={260 + rev} y2={815} stroke="#FFF3DC" strokeWidth={3} opacity={0.6} />
        <Bloom blur={28} opacity={0.6}>
          <line x1={260 + rev} y1={290} x2={260 + rev} y2={815} stroke="#FFF3DC" strokeWidth={3} />
        </Bloom>
      </g>
      <Motes local={local} n={26} color="rgba(255,238,210,0.3)" />
      {draft ? <DraftListen /> : null}
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 06 三根柱子：门槛越高，评价越高 ---------------- */
const BAR_DATA = [
  {v: 8.2, k: 'A'}, // 高门槛：跨过最高的那道坎
  {v: 5.1, k: 'B'}, // 中门槛
  {v: 3.3, k: 'C'}, // 无门槛
].map((b) => ({...b, ...GROUPS.find((g) => g.k === b.k)!}));

/* ---------------- 草稿专用：柱状图站在一个房间里 ---------------- */
const DraftRoom: React.FC = () => (
  <>
    {/* 后墙 */}
    <rect width={1920} height={804} fill="#0C0B0E" />
    <rect width={1920} height={804} fill="url(#roomSide)" />
    {/* 踢脚线：墙落地的地方 */}
    <rect y={726} width={1920} height={12} fill="#16141A" />
    <rect y={723} width={1920} height={2.5} fill="#FFD79A" opacity={0.13} />
    {/* 地面 + 地面上的光 */}
    <rect y={738} width={1920} height={342} fill="#0A0810" />
    <ellipse cx={960} cy={856} rx={820} ry={190} fill="#FFC874" opacity={0.09} style={{filter: 'blur(90px)'}} />
  </>
);

const Bars: React.FC<S> = ({local, mode = 'show'}) => {
  const draft = React.useContext(DraftCtx);
  const ask = mode === 'ask';
  const floor = 726;
  const head = interpolate(local, [2, 9], [0, 1], clamp);
  return (
    <Svg bg="#060608">
      <DraftRoom />
      {/* 画面自己交代"这是给什么打的分" */}
      <g opacity={head}>
        <text x={150} y={196} fill="rgba(255,246,230,0.62)" style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 30, letterSpacing: '0.14em'}}>
          给这段讨论打分
        </text>
        <line x1={150} y1={218} x2={150 + 300 * head} y2={218} stroke={P.warm} strokeWidth={2} opacity={0.62} />
      </g>
      <Ticks y={floor + 4} color="rgba(255,236,204,0.16)" />
      {BAR_DATA.map((b, i) => {
        const p = ask ? 0 : spring({frame: local - 1 - i * 4, fps: 30, config: {damping: 16, mass: 0.65, stiffness: 150}});
        const h = 408 * (b.v / 8.2) * p;
        const cx = 580 + i * 380;
        return (
          <g key={b.label}>
            {ask ? (
              <rect
                x={cx - 62}
                y={floor - 408}
                width={124}
                height={408}
                fill="none"
                stroke="rgba(255,246,230,0.14)"
                strokeWidth={2}
                strokeDasharray="9 12"
              />
            ) : null}
            {p > 0.06 ? (
              <>
                {/* 投影：光从左上来，影子往右下 */}
                <ellipse cx={cx + 30} cy={floor + 8} rx={82} ry={17} fill="#000" opacity={0.55} style={{filter: 'blur(13px)'}} />
                {/* 地面倒影 */}
                <rect x={cx - 62} y={floor + 2} width={124} height={Math.min(74, h * 0.24)} fill={b.c} opacity={0.16} style={{filter: 'blur(7px)'}} />
              </>
            ) : null}
            <rect x={cx - 62} y={floor - h} width={124} height={h} fill={b.c} opacity={0.9} />
            <Bloom blur={40} opacity={0.35}>
              <rect x={cx - 62} y={floor - h} width={124} height={h} fill={b.c} />
            </Bloom>
            <rect x={cx - 62} y={floor - h} width={124} height={4} fill="#FFF6E6" opacity={0.85} />
            {p > 0.08 ? (
              <text
                x={cx}
                y={floor - h - 24}
                textAnchor="middle"
                fill={b.c}
                opacity={Math.min(1, p * 1.4)}
                style={{fontFamily: '"Consolas", monospace', fontSize: 52}}
              >
                {(b.v * p).toFixed(1)}
              </text>
            ) : null}
            <text
              x={cx}
              y={floor + 56}
              textAnchor="middle"
              style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 30, fontWeight: 700}}
            >
              <tspan fill={b.c}>{b.k} 组</tspan>
              <tspan fill="rgba(255,246,230,0.66)" dx={10}>
                {b.label}
              </tspan>
            </text>
          </g>
        );
      })}
      <text x={1810} y={floor + 56} textAnchor="end" fill="rgba(255,246,230,0.26)" style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 20}}>
        数值为示意
      </text>
      <g style={{filter: 'blur(13px)'}} opacity={0.95}>
          {/* 左下前景：一台录音机，压住角落、交代"在听录音" */}
          <rect x={-40} y={624} width={330} height={250} rx={14} fill="#181310" />
          <rect x={-40} y={624} width={330} height={7} rx={4} fill="#FFD79A" opacity={0.2} />
          <circle cx={62} cy={742} r={58} fill="#090705" />
          <circle cx={62} cy={742} r={58} fill="none" stroke="#8A6A44" strokeWidth={4} opacity={0.5} />
          <circle cx={62} cy={742} r={20} fill="#2E2218" />
          <circle cx={212} cy={742} r={40} fill="#090705" />
          <circle cx={212} cy={742} r={40} fill="none" stroke="#8A6A44" strokeWidth={3} opacity={0.34} />
      </g>
      <Motes local={local} n={24} color="rgba(255,238,210,0.3)" />
    </Svg>
  );
};

/* ---------------- 03 雨夜街景（复用平涂：磁带机 / 三扇门） ---------------- */
const TapeFast: React.FC<S> = ({local, dur}) => (
  <>
    <FLAT.tape local={local + 4} dur={dur} />
    {/* 顶上打下来一道柔光，给机器一点"陈列"感 */}
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <polygon points="812,-40 1108,-40 1520,900 400,900" fill="#FFD79A" opacity={0.055} style={{filter: 'blur(46px)'}} />
      <polygon points="880,-40 1040,-40 1300,900 620,900" fill="#FFD79A" opacity={0.06} style={{filter: 'blur(46px)'}} />
    </svg>
    {/* 机器后面一团暖光，别让它像贴在灰墙上 */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(46% 56% at 50% 42%, rgba(255,214,150,0.13) 0%, rgba(255,200,120,0.05) 44%, rgba(255,200,120,0) 76%)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(4,4,7,0.62) 0%, rgba(4,4,7,0.18) 15%, rgba(4,4,7,0) 30%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

const CorridorFast: React.FC<S> = ({local, dur}) => (
  <>
    <FLAT.corridor local={local + 2} dur={dur} />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(4,4,7,0.62) 0%, rgba(4,4,7,0.18) 15%, rgba(4,4,7,0) 30%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

/* ---------------- 雨夜街景（备用） ---------------- */
const Street: React.FC<S> = ({local}) => {
  const flick = 0.78 + 0.22 * Math.sin(local / 3.1) * Math.sin(local / 7.3);
  const rain = Array.from({length: 90}, (_, i) => {
    const x = ((i * 137.5 + local * 9) % 2100) - 90;
    const y = ((i * 211 + local * 34) % 1140) - 60;
    const len = 28 + ((i * 53) % 60);
    return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + len} stroke="rgba(206,222,246,0.2)" strokeWidth={1.6} />;
  });
  return (
    <Svg bg="#07070A">
      {/* 楼群剪影 */}
      <rect x={0} y={210} width={1920} height={760} fill="#0D1016" />
      {Array.from({length: 8}, (_, i) => (
        <rect key={i} x={-40 + i * 250} y={260 + (i % 3) * 50} width={170} height={700} fill="#090B10" />
      ))}
      {/* 店门面：一块大的暖光橱窗 */}
      <g>
        <rect x={430} y={250} width={1060} height={560} rx={8} fill="#0A0A0E" />
        <rect x={458} y={278} width={1004} height={504} fill={P.warm} opacity={0.9} />
        <rect x={458} y={278} width={1004} height={504} fill={P.warm} opacity={0.35 * flick} />
        {/* 屋里：台面与两个背影 */}
        <rect x={458} y={600} width={1004} height={182} fill="#B98A55" opacity={0.85} />
        <rect x={458} y={600} width={1004} height={10} fill="#7A5230" />
        {[700, 1180].map((x) => (
          <g key={x} opacity={0.75}>
            <circle cx={x} cy={520} r={30} fill="#5C3E24" />
            <path d={`M${x - 54} 600 C${x - 54} 540 ${x - 32} 522 ${x} 522 C${x + 32} 522 ${x + 54} 540 ${x + 54} 600 Z`} fill="#5C3E24" />
          </g>
        ))}
        {/* 窗棂 */}
        <rect x={950} y={278} width={16} height={504} fill="#0A0A0E" />
        <rect x={458} y={508} width={1004} height={14} fill="#0A0A0E" />
        {/* 屋内的灯 */}
        {[640, 900, 1170, 1360].map((x) => (
          <g key={x}>
            <circle cx={x} cy={366} r={13} fill="#FFF8E8" />
            <circle cx={x} cy={366} r={34} fill="#FFEBC4" opacity={0.4 * flick} style={{filter: 'blur(16px)'}} />
          </g>
        ))}
        {/* 屋檐上的灯管 */}
        <rect x={500} y={214} width={920} height={16} rx={8} fill={P.warm} opacity={0.75 * flick} />
        <Bloom blur={70} opacity={0.55 * flick}>
          <rect x={500} y={214} width={920} height={16} rx={8} fill={P.warm} />
        </Bloom>
        <Bloom blur={110} opacity={0.35}>
          <rect x={458} y={278} width={1004} height={504} fill={P.warm} />
        </Bloom>
      </g>
      {/* 湿地面：整块暗，中间一片柔和的暖反光 */}
      <rect y={810} width={1920} height={270} fill="#08080C" />
      <ellipse cx={960} cy={870} rx={620} ry={150} fill={P.warm} opacity={0.16} style={{filter: 'blur(60px)'}} />
      <ellipse cx={960} cy={990} rx={900} ry={220} fill={P.warm} opacity={0.07} style={{filter: 'blur(80px)'}} />
      {rain}
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 01 排队（复用平涂场景） ---------------- */
const Queue: React.FC<S> = ({local, dur}) => <FLAT.shop local={local + 6} dur={dur} />;

/* ---------------- 数字滚动（备用） ---------------- */
const Counter: React.FC<S> = ({local, value = 120, text = '分钟'}) => {
  const p = interpolate(local, [0, 12], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const v = Math.round(value * p);
  return (
    <Svg bg="#07070A">
      <text x={880} y={582} textAnchor="end" fill="#FFF6E6" style={{fontFamily: '"Consolas", monospace', fontSize: 330, fontWeight: 700}}>
        {String(v).padStart(3, '0')}
      </text>
      <text x={920} y={556} fill={P.warm} style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 96, fontWeight: 700}}>
        {text}
      </text>
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 02/03 面碗（内部动作：热气、筷子、挑面、盖章） ---------------- */
/* ---------------- 草稿专用：俯视桌面（只在 EffortDraft 里生效） ---------------- */
const DraftDesk: React.FC = () => (
  <>
    {/* 桌面底色：比纯黑高两档，能看出是一块"面"而不是虚空 */}
    <rect width={1920} height={1080} fill="#1A140A" />
    {/* 顶灯：一盏偏右上的灯，光斑收住，别糊满全屏 */}
    <ellipse cx={1120} cy={400} rx={470} ry={330} fill="#FFC874" opacity={0.16} style={{filter: 'blur(64px)'}} />
    <ellipse cx={1010} cy={540} rx={360} ry={260} fill="#FFD79A" opacity={0.08} style={{filter: 'blur(90px)'}} />
    {/* 桌板缝：两条极暗的横线，给桌面一个尺度 */}
    <rect x={0} y={742} width={1920} height={5} fill="#0A0704" opacity={0.55} />
    <rect x={0} y={930} width={1920} height={6} fill="#0A0704" opacity={0.5} />
    {/* 桌面走向：三条很宽的柔光带，不用细线（细线看着像虚线） */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-120} y={180 + i * 260} width={2160} height={86} fill="#FFD79A" opacity={0.022} style={{filter: 'blur(26px)'}} />
    ))}
    {/* 碗的投影：往右下偏，让碗真的"压"在桌上。必须在道具之前，否则会把筷子压暗成两截 */}
    <ellipse cx={1052} cy={726} rx={428} ry={388} fill="#000" opacity={0.72} style={{filter: 'blur(52px)'}} />
    {/* 桌沿：最下方一条暗带，把桌面收住 */}
    <rect x={0} y={1004} width={1920} height={76} fill="#050403" opacity={0.9} />
    {/* 左下：一只小碟（俯视，虚焦） */}
    <g style={{filter: 'blur(9px)'}}>
      <ellipse cx={212} cy={892} rx={132} ry={124} fill="#000" opacity={0.5} />
      <ellipse cx={196} cy={872} rx={128} ry={122} fill="#2A2015" />
      <ellipse cx={196} cy={872} rx={128} ry={122} fill="none" stroke="#8A6A44" strokeWidth={3.5} opacity={0.5} />
      <ellipse cx={196} cy={872} rx={90} ry={86} fill="#0D0A06" />
      <path d="M68 872 A128 122 0 0 1 324 872" stroke="#C39A5C" strokeWidth={5} opacity={0.16} fill="none" />
    </g>
    {/* 右侧：一双筷子（俯视，斜放，虚焦） */}
    <g transform="rotate(-13 1600 690)" style={{filter: 'blur(10px)'}} opacity={0.95}>
      <rect x={1372} y={662} width={500} height={24} rx={10} fill="#000" opacity={0.45} />
      <rect x={1372} y={706} width={500} height={24} rx={10} fill="#000" opacity={0.45} />
      <rect x={1370} y={648} width={500} height={17} rx={8} fill="#33271A" />
      <rect x={1370} y={692} width={500} height={17} rx={8} fill="#2A1F15" />
      <rect x={1370} y={648} width={500} height={3.5} rx={2} fill="#C39A5C" opacity={0.4} />
      <rect x={1370} y={692} width={500} height={3.5} rx={2} fill="#C39A5C" opacity={0.3} />
    </g>
    {/* 右上：一只空茶杯（俯视，虚焦，落在灯的光里） */}
    <g style={{filter: 'blur(8px)'}}>
      <circle cx={1668} cy={232} r={118} fill="#000" opacity={0.45} />
      <circle cx={1652} cy={214} r={116} fill="#2A2016" />
      <circle cx={1652} cy={214} r={116} fill="none" stroke="#8A6A44" strokeWidth={4} opacity={0.5} />
      <circle cx={1652} cy={214} r={88} fill="#0C0905" />
      <ellipse cx={1652} cy={228} rx={62} ry={54} fill="#8A5E28" opacity={0.28} />
      <path d="M1536 214 A116 116 0 0 1 1768 214" stroke="#FFD79A" strokeWidth={7} opacity={0.22} fill="none" />
    </g>
  </>
);

const Bowl: React.FC<S> = ({local, mode = 'full'}) => {
  const draft = React.useContext(DraftCtx);
  const rot = -5 + local * 0.32;
  const empty = mode === 'empty';

  const enter = interpolate(local, [20, 30], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const lift = interpolate(local, [30, 46], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 2)});

  const steam = Array.from({length: 9}, (_, i) => {
    const ph = i / 9;
    const x = 610 + i * 78;
    const rise = (local * 9 + i * 47) % 220;
    const h = 250 + rise;
    const sway = Math.sin(local / 6 + i * 1.3) * 34;
    const fade = empty ? 0.4 : 1;
    return (
      <path
        key={i}
        d={`M${x} ${540 - rise * 0.3} C${x + sway} ${540 - h * 0.4} ${x - sway * 1.3} ${540 - h * 0.72} ${x + sway * 0.7} ${540 - h}`}
        stroke="rgba(255,246,232,0.62)"
        strokeWidth={14 + (i % 3) * 7}
        fill="none"
        strokeLinecap="round"
        style={{filter: 'blur(11px)'}}
        opacity={(0.22 + ph * 0.2) * fade}
      />
    );
  });

  const stamp = spring({frame: local - 8, fps: 30, config: {damping: 12, mass: 0.6, stiffness: 140}});

  return (
    <Svg bg="#0B0805">
      <DraftDesk />
      <g style={{transform: `translate(960px, 486px) rotate(${rot}deg) scale(0.84)`, transformOrigin: '0 0'}}>
        <circle cx={0} cy={0} r={430} fill="#191411" />
        <circle cx={0} cy={0} r={430} fill="none" stroke="#2C231B" strokeWidth={22} />
        <circle cx={0} cy={0} r={402} fill="none" stroke="rgba(255,214,150,0.22)" strokeWidth={5} />
        <circle cx={0} cy={0} r={388} fill={empty ? '#4A2E12' : 'url(#fSoup)'} />
        <Bloom blur={90} opacity={empty ? 0.18 : 0.32}>
          <circle cx={0} cy={0} r={360} fill={P.warm} />
        </Bloom>

        {!empty ? (
          <>
            {Array.from({length: 15}, (_, i) => {
              const R = (k: number) => (Math.sin(i * 91.7 + k * 47.3) + 1) / 2;
              const y = -244 + i * 33 + R(1) * 16;
              const x0 = -330 + R(2) * 150;
              const x1 = 170 + R(3) * 190;
              const a = Math.sin(local / 7 + i * 1.7) * 30;
              const b2 = Math.cos(local / 9 + i) * 26;
              const cxp = -60 + R(4) * 160;
              const cyp = y + (R(5) - 0.5) * 70;
              const pull = i > 6 ? lift * (28 + R(8) * 40) : lift * 10;
              return (
                <path
                  key={i}
                  d={`M${x0} ${y + 10} C${x0 + 130} ${y - 34 + a} ${cxp} ${cyp + b2 - pull} ${x1} ${y - 8 - pull}`}
                  stroke={i % 4 === 0 ? '#FFF2D6' : i % 3 === 0 ? '#E8CE9A' : '#F5E0B4'}
                  strokeWidth={11 + R(6) * 12}
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.88 + R(7) * 0.12}
                />
              );
            })}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={`l${i}`}
                d={`M${-40 + i * 46} ${60 + i * 20} C${-10 + i * 50} ${60 - 90 * lift} ${120 + i * 40} ${-20 - 120 * lift} ${210 + i * 26} ${-60 - 150 * lift}`}
                stroke="#F8E6BE"
                strokeWidth={16}
                fill="none"
                strokeLinecap="round"
                opacity={0.95 * Math.min(1, lift * 1.6)}
              />
            ))}
            <ellipse cx={158} cy={-116} rx={112} ry={92} fill="#FFF8E8" />
            <ellipse cx={158} cy={-116} rx={112} ry={92} fill="none" stroke="rgba(180,130,70,0.35)" strokeWidth={4} />
            <ellipse cx={166} cy={-110} rx={50} ry={43} fill="#F0A030" />
            <ellipse cx={152} cy={-124} rx={18} ry={14} fill="#FFD884" opacity={0.85} />
            {Array.from({length: 34}, (_, i) => {
              const cx = -260 + ((i * 137) % 470);
              const cy = -190 + ((i * 197) % 380);
              return (
                <ellipse key={i} cx={cx} cy={cy} rx={11} ry={5} fill={i % 4 === 0 ? '#8FD96F' : '#6FBF5E'} opacity={0.9} transform={`rotate(${(i * 47) % 180} ${cx} ${cy})`} />
              );
            })}
            {Array.from({length: 22}, (_, i) => (
              <circle key={i} cx={-280 + ((i * 173) % 520)} cy={-210 + ((i * 211) % 400)} r={3 + (i % 4) * 4} fill={i % 5 === 0 ? '#E2603A' : '#FFE9B8'} opacity={0.4 + (i % 3) * 0.2} />
            ))}
          </>
        ) : (
          <>
            <ellipse cx={0} cy={0} rx={306} ry={286} fill="#33200C" opacity={0.6} />
            <ellipse cx={0} cy={0} rx={306} ry={286} fill="none" stroke="rgba(255,220,170,0.1)" strokeWidth={10} />
            {Array.from({length: 12}, (_, i) => {
              const cx = -220 + ((i * 173) % 440);
              const cy = -160 + ((i * 127) % 320);
              return <ellipse key={i} cx={cx} cy={cy} rx={10} ry={5} fill="#5F8F4A" opacity={0.5} transform={`rotate(${(i * 61) % 180} ${cx} ${cy})`} />;
            })}
            {/* 搭在碗沿的筷子 */}
            <g transform="rotate(-16)">
              <rect x={150} y={372} width={520} height={16} rx={8} fill="#4A3524" />
              <rect x={150} y={412} width={520} height={16} rx={8} fill="#3A2A1C" />
            </g>
            {/* 「值」落下 */}
            <g opacity={Math.min(1, stamp * 2)} style={{transform: `scale(${1.55 - 0.55 * stamp})`, transformOrigin: '0 0'}}>
              <text x={0} y={96} textAnchor="middle" fill="#FFF6E6" style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 290, fontWeight: 900}}>
                值
              </text>
              <Bloom blur={44} opacity={0.5}>
                <text x={0} y={96} textAnchor="middle" fill="#FFF6E6" style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 290, fontWeight: 900}}>
                  值
                </text>
              </Bloom>
            </g>
          </>
        )}
      </g>

      {!empty ? (
        <g transform={`translate(${(1 - enter) * 520},${(1 - enter) * -180 - lift * 40}) rotate(24 1200 240)`} opacity={enter}>
          <rect x={900} y={150} width={700} height={20} rx={10} fill="#3B2A1C" />
          <rect x={900} y={196} width={700} height={20} rx={10} fill="#4A3524" />
          <rect x={1470} y={148} width={140} height={24} rx={12} fill={P.warm} opacity={0.9} />
          <rect x={1470} y={194} width={140} height={24} rx={12} fill={P.warm} opacity={0.9} />
        </g>
      ) : null}

      {steam}
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 04 大脑改价 ---------------- */
const PROFILE =
  'M120 700 C60 660 30 580 30 470 C30 330 140 230 285 230 C390 230 452 300 452 380 L452 420 L520 496 L448 512 L456 552 L404 566 L404 620 L452 700 Z';

const Brain: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  const pulse = 0.55 + 0.45 * Math.sin(local / 12);
  const flip = interpolate(local, [20, 32], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const price = 3.3 + (8.2 - 3.3) * flip;
  const swing = Math.sin(local / 16) * 3;

  return (
    <Svg bg="#0A0A0D">
      <g transform="translate(430,140)">
        <path d="M10 900 C40 760 140 660 272 660 C402 660 500 770 546 900 Z" fill="#15151B" />
        <path d={PROFILE} fill="#15151B" />
        <path d={PROFILE} fill="none" stroke="rgba(244,240,232,0.14)" strokeWidth={3} />
        <ellipse cx={250} cy={430} rx={54 + pulse * 10} ry={44 + pulse * 8} fill={P.warm} opacity={0.5} />
        <Bloom blur={70} opacity={0.5}>
          <ellipse cx={250} cy={430} rx={54} ry={44} fill={P.warm} />
        </Bloom>
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2 + local / 90;
          const r = 96 + Math.sin(local / 22 + i) * 12;
          return <circle key={i} cx={250 + Math.cos(a) * r} cy={430 + Math.sin(a) * r * 0.7} r={2.6} fill={P.warm} opacity={0.4} />;
        })}
      </g>

      {draft ? <DraftMemories local={local} /> : null}

      <path
        d={`M760 470 C${880 + 30 * flip} 470 980 452 1080 452`}
        stroke="rgba(232,177,92,0.4)"
        strokeWidth={3}
        strokeDasharray="10 10"
        fill="none"
        opacity={0.45 + flip * 0.4}
      />

      <g transform={`translate(1330,470) rotate(${swing})`}>
        <path d="M0 -300 L0 -196" stroke="#3A3A44" strokeWidth={4} />
        <circle cx={0} cy={-196} r={9} fill="#2A2A32" stroke="#4A4A56" strokeWidth={3} />
        <rect x={-192} y={-186} width={384} height={430} rx={18} fill="#1A1712" stroke="#3A3025" strokeWidth={3} />
        <rect x={-192} y={-186} width={384} height={430} rx={18} fill={P.warm} opacity={0.06 + flip * 0.07} />
        <text x={0} y={-104} textAnchor="middle" fill="rgba(244,240,232,0.45)" style={{fontFamily: '"Consolas", monospace', fontSize: 26, letterSpacing: '0.4em'}}>
          VALUE
        </text>
        <text x={0} y={96} textAnchor="middle" fill="#FFF3DE" style={{fontFamily: '"Consolas", monospace', fontSize: 180, fontWeight: 700}}>
          {price.toFixed(1)}
        </text>
        <g opacity={flip * 0.75}>
          <line x1={-116} y1={40} x2={116} y2={40} stroke="#E2603A" strokeWidth={5} />
        </g>
        <Bloom blur={44} opacity={0.2 + flip * 0.35}>
          <rect x={-192} y={-186} width={384} height={430} rx={18} fill={P.warm} />
        </Bloom>
      </g>

      <Motes local={local} n={26} color="rgba(255,238,210,0.4)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 05 片名 ---------------- */
const Title: React.FC<S> = ({local, text = '', sub}) => {
  const chars = [...text];
  const gap = chars.length > 4 ? 206 : 300;
  const size = chars.length > 4 ? 200 : 300;
  return (
    <Svg bg="#060608">
      <Bloom blur={160} opacity={0.18}>
        <ellipse cx={960} cy={500} rx={680} ry={300} fill={P.warm} />
      </Bloom>
      {chars.map((ch, i) => {
        const p = spring({frame: local - i * 2.5, fps: 30, config: {damping: 15, mass: 0.7, stiffness: 200}});
        return (
          <g key={i} style={{transform: `translate(${960 + (i - (chars.length - 1) / 2) * gap}px, 470px) scale(${0.7 + p * 0.3})`, transformOrigin: '0 0'}}>
            <text x={0} y={0} textAnchor="middle" fill="#FFF8EC" opacity={Math.min(1, p * 1.6)} style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: size, fontWeight: 900}}>
              {ch}
            </text>
          </g>
        );
      })}
      <rect x={960 - 320 * interpolate(local, [8, 20], [0, 1], clamp)} y={620} width={640 * interpolate(local, [8, 20], [0, 1], clamp)} height={2} fill={P.warm} opacity={0.85} />
      <text x={960} y={700} textAnchor="middle" fill={P.warm} opacity={interpolate(local, [12, 24], [0, 0.9], clamp)} style={{fontFamily: '"Consolas", monospace', fontSize: 30, letterSpacing: '0.42em'}}>
        {sub}
      </text>
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 备用镜头 ---------------- */
const Slam: React.FC<S> = ({local, text = '', sub}) => {
  const a = slamIn(local, 0);
  const size = [...text].length <= 2 ? 372 : 250;
  return (
    <Svg>
      <rect x={interpolate(local, [0, 9], [-700, 2100], clamp) - 240} y={0} width={480} height={1080} fill="url(#fStreak)" opacity={0.2} />
      <g style={{transform: `translate(960px, 500px) scale(${a.scale})`, transformOrigin: '0 0'}}>
        <text x={0} y={0} textAnchor="middle" fill="#FFF6E6" style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: size, fontWeight: 900, letterSpacing: '0.15em', opacity: a.opacity, filter: `blur(${a.blur}px)`}}>
          {text}
        </text>
      </g>
      {sub ? (
        <text x={960} y={760} textAnchor="middle" fill={P.warm} opacity={interpolate(local, [4, 10], [0, 0.95], clamp)} style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 62, letterSpacing: '0.5em'}}>
          {sub}
        </text>
      ) : null}
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

const Desk: React.FC<S> = ({local, dur}) => <FLAT.desk local={local + 10} dur={dur} />;
const Profile: React.FC<S> = ({local, dur}) => <FLAT.profile local={local + 8} dur={dur} />;

const ScaleFast: React.FC<S> = ({local}) => {
  const tilt = -4 - 10 * spring({frame: local - 10, fps: 30, config: {damping: 12, mass: 0.6}});
  return (
    <Svg bg="#08080B">
      <g transform="translate(960,800)">
        <line x1={0} y1={0} x2={0} y2={-360} stroke="#3A3A44" strokeWidth={11} />
        <ellipse cx={0} cy={0} rx={170} ry={18} fill="#22222A" />
        <g transform={`rotate(${tilt})`}>
          <line x1={-330} y1={-360} x2={330} y2={-360} stroke={P.warm} strokeWidth={9} strokeLinecap="round" />
          {[-1, 1].map((s) => (
            <g key={s}>
              <line x1={s * 330} y1={-360} x2={s * 330} y2={-292} stroke="rgba(244,240,232,0.4)" strokeWidth={3} />
              <path d={`M${s * 330 - 110} -292 L${s * 330 + 110} -292 L${s * 330 + 72} -212 L${s * 330 - 72} -212 Z`} fill="#1D1D25" stroke="#33333C" strokeWidth={3} />
            </g>
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-400} y={-320 - i * 34} width={140} height={30} fill={P.warm} opacity={0.3 + i * 0.12} />
          ))}
          <circle cx={330} cy={-272} r={8} fill={P.mint} opacity={0.75} />
        </g>
      </g>
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

const PillarsFast: React.FC<S> = ({local, value = 3}) => {
  const BARS = [
    {v: 8.2, label: '高门槛', c: '#E8B15C'},
    {v: 5.1, label: '低门槛', c: '#CFC6B4'},
    {v: 3.3, label: '无门槛', c: '#8E887C'},
  ];
  return (
    <Svg bg="#08080B">
      <g stroke="rgba(244,240,232,0.14)" strokeWidth={2}>
        <line x1={160} y1={760} x2={1760} y2={760} />
      </g>
      {BARS.map((b, i) => {
        const on = value >= i + 1;
        const p = on ? spring({frame: local - i * 5, fps: 30, config: {damping: 11, mass: 0.4, stiffness: 160}}) : 0;
        if (p < 0.02) return null;
        const h = 440 * (b.v / 8.2) * p;
        const cx = 560 + i * 400;
        return (
          <g key={b.label}>
            <rect x={cx - 84} y={760 - h} width={168} height={h} fill={b.c} opacity={0.9} />
            <Bloom blur={60} opacity={0.5}>
              <rect x={cx - 84} y={760 - h} width={168} height={h} fill={b.c} />
            </Bloom>
            <text x={cx} y={760 - h - 34} textAnchor="middle" fill="#FFF1DC" opacity={p} style={{fontFamily: '"Consolas", monospace', fontSize: 66, fontWeight: 700}}>
              {(b.v * p).toFixed(1)}
            </text>
            <text x={cx} y={830} textAnchor="middle" fill={P.ink} opacity={p} style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 38, fontWeight: 700}}>
              {b.label}
            </text>
          </g>
        );
      })}
      <Motes local={local} n={30} color="rgba(255,238,210,0.45)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

const Flash: React.FC<S> = ({local, text = ''}) => {
  const white = interpolate(local, [0, 1, 2, 4], [1, 1, 0.72, 0], clamp);
  const onBlack = interpolate(local, [2, 5], [0, 1], clamp);
  return (
    <Svg bg="#0A0806">
      <rect width={1920} height={1080} fill="#FFF8EC" opacity={white} />
      <text x={960} y={562} textAnchor="middle" fill="#FFF6E6" opacity={onBlack} style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 118, fontWeight: 900}}>
        {text}
      </text>
      <text x={960} y={562} textAnchor="middle" fill="#120D06" opacity={interpolate(local, [0, 2, 4], [1, 1, 0], clamp)} style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 118, fontWeight: 900}}>
        {text}
      </text>
      <rect width={1920} height={1080} fill="url(#fVig)" opacity={onBlack} />
    </Svg>
  );
};

/* ---------------- 草稿专用：天平所在的房间 ---------------- */
const DraftBalanceStage: React.FC = () => (
  <>
    {/* 墙不另画一层：原场景的黑底就是墙。只补地面，别把整块画面提亮成棕灰 */}
    {/* 右后一扇窗的暖光（虚焦），给墙一个"有窗"的证据 */}
    <ellipse cx={1520} cy={380} rx={210} ry={290} fill="#FFD79A" opacity={0.1} style={{filter: 'blur(92px)'}} />
    {/* 地面 + 地平线 */}
    <rect x={-620} y={862} width={3200} height={600} fill="#040405" />
    <rect x={-620} y={859} width={3200} height={3} fill="#FFD79A" opacity={0.05} />
    <ellipse cx={960} cy={906} rx={440} ry={112} fill="#FFC874" opacity={0.08} style={{filter: 'blur(76px)'}} />
    {/* 天平的投影：影子往右下拉 */}
    <ellipse cx={1016} cy={896} rx={286} ry={24} fill="#000" opacity={0.6} style={{filter: 'blur(20px)'}} />
    {/* 右后方一个柜子的剪影（虚焦），给房间一个深度 */}
    <g style={{filter: 'blur(30px)'}} opacity={0.85}>
      <rect x={1760} y={320} width={240} height={550} fill="#08070A" />
      <rect x={1760} y={320} width={240} height={4} fill="#C39A5C" opacity={0.12} />
      <rect x={1776} y={556} width={208} height={3} fill="#C39A5C" opacity={0.07} />
    </g>
  </>
);

/* ---------------- 11 天平：付出 对 结果 ---------------- */
const ROCKS = [
  {dx: -46, dy: 4, s: 1.04, rot: -8, c: '#463C2C'},
  {dx: 16, dy: 2, s: 0.96, rot: 12, c: '#514532'},
  {dx: 48, dy: 6, s: 0.8, rot: -16, c: '#3F3526'},
  {dx: -24, dy: -20, s: 0.88, rot: 6, c: '#574B36'},
  {dx: 22, dy: -24, s: 0.7, rot: 22, c: '#4C4130'},
];

const Balance: React.FC<S> = ({local, mode = 'wide', value = 1}) => {
  const draft = React.useContext(DraftCtx);
  const wide = mode === 'wide';
  const worse = wide && value === 2;
  const unload = mode === 'unload';
  const zoom = wide || unload ? (value === 2 ? 1.34 : 1.24) : 2.2;
  const focusX = mode === 'left' ? 645 : mode === 'right' || mode === 'swap' ? 1275 : 960;
  const focusY = mode === 'left' ? 640 : mode === 'right' || mode === 'swap' ? 560 : 730;
  const tx = 960 - focusX * zoom;
  const ty = 540 - focusY * zoom;

  // 各景别的倾斜：左重则左端下沉
  let tilt: number;
  if (mode === 'left') {
    tilt = 3 + 9 * spring({frame: local - 4, fps: 30, config: {damping: 16, mass: 0.9}});
  } else if (mode === 'right') {
    tilt = 11 + Math.sin(local / 30) * 0.6;
  } else if (mode === 'swap') {
    // 右边被标贵之后，天平自己回正 —— 右边沉下去，两边"看起来"就相称了
    const back = spring({frame: local - 10, fps: 30, config: {damping: 14, mass: 0.8}});
    tilt = 11 - 11 * back;
  } else if (worse) {
    tilt = 9 + 11 * spring({frame: local - 2, fps: 30, config: {damping: 15, mass: 0.9}}) + Math.sin(local / 30) * 0.6;
  } else if (unload) {
    // 拆掉付出：从左盘被端走开始是平的，端走之后右边那一粒的**真实分量**把秤微微压向右
    tilt = -4.5 * spring({frame: local - 36, fps: 30, config: {damping: 15, mass: 0.9}});
  } else {
    tilt = 9 + Math.sin(local / 34) * 0.7;
  }
  // tilt 为正 = 左端下沉（左盘更重）
  const rad = (tilt * Math.PI) / 180;
  const ARM = 318;
  const lx = -ARM * Math.cos(rad);
  const ly = ARM * Math.sin(rad);
  const rx = ARM * Math.cos(rad);
  const ry = -ARM * Math.sin(rad);

  // 全景里左盘已经堆满，所以切到左盘特写时底下三块必须"本来就在"，
  // 只让最上面两块重新砸进来 —— 否则观众会看到石头重掉一遍（穿帮）。
  const drop = (i: number) => {
    if (mode !== 'left') return 1;
    if (i < 3) return 1;
    const t = Math.max(0, Math.min(1, (local - (i - 3) * 7) / 7));
    return 1 - Math.pow(1 - t, 3);
  };

  // 右边那一粒被"点亮"：不换物体、不变大小，只是改了看它的方式
  // unload 反过来：上一镜还亮着，这一镜光慢慢熄掉——拆掉付出之后，才看见它本来的样子
  const glowOp =
    mode === 'swap' ? interpolate(local, [6, 16], [0, 1], clamp) : unload ? 1 - interpolate(local, [28, 66], [0, 1], clamp) : 0;
  const ripple = mode === 'swap' ? interpolate(local, [6, 30], [0, 1], clamp) : 1;
  // 左盘连石头一起被端出画面
  const panOut = unload ? interpolate(local, [8, 48], [0, 1], {...clamp, easing: (x) => x * x * (3 - 2 * x)}) : 0;

  const pivotY = 520;
  return (
    <Svg bg="#060608">
      <g transform={`translate(${tx},${ty}) scale(${zoom})`}>
        <DraftBalanceStage />
        {/* 顶光 */}
        <g style={{filter: 'blur(52px)'}} opacity={0.19}>
          <polygon points="912,-40 1008,-40 1400,900 520,900" fill="#FFD79A" />
        </g>
        {/* 天平后面的逆光：让它从黑里"立"出来 */}
        <ellipse cx={960} cy={610} rx={720} ry={330} fill="#FFC874" opacity={0.13} style={{filter: 'blur(100px)'}} />
        <ellipse cx={960} cy={760} rx={520} ry={150} fill="#FFB85C" opacity={0.1} style={{filter: 'blur(80px)'}} />
        {/* 底座与立柱：要"落地"，不能悬在黑里 */}
        <ellipse cx={960} cy={888} rx={230} ry={30} fill="#FFB85C" opacity={0.055} style={{filter: 'blur(34px)'}} />
        <ellipse cx={960} cy={882} rx={210} ry={24} fill="#17150F" />
        <ellipse cx={960} cy={876} rx={210} ry={24} fill="#2A2519" />
        <ellipse cx={960} cy={876} rx={210} ry={24} fill="none" stroke="#6B5A3E" strokeWidth={2} opacity={0.55} />
        <ellipse cx={960} cy={871} rx={168} ry={16} fill="none" stroke="#8A7048" strokeWidth={1.4} opacity={0.28} />
        {/* 立柱必须顶到 pivotY，否则秤杆和柱头之间会露出一道缝（看着就是"浮空"） */}
        <path d="M942 876 L978 876 L970 512 L950 512 Z" fill="#3C3526" />
        <path d="M948 876 L956 876 L959 512 L953 512 Z" fill="#63543A" opacity={0.75} />
        <path d="M970 876 L974 876 L967 512 L962 512 Z" fill="#15120D" opacity={0.5} />
        {/* 轴：暖色，别用蓝灰（暖光里会发紫） */}
        <circle cx={960} cy={pivotY} r={16} fill="#2E2921" />
        <circle cx={960} cy={pivotY} r={16} fill="none" stroke="#7A6544" strokeWidth={2} />
        <circle cx={955} cy={pivotY - 5} r={4} fill="#B2935F" opacity={0.5} />
        <Bloom blur={30} opacity={0.4}>
          <circle cx={960} cy={pivotY} r={15} fill={P.warm} />
        </Bloom>
        {/* 横梁 */}
        <g transform={`rotate(${-tilt} 960 ${pivotY})`}>
          <line x1={960 - ARM} y1={pivotY} x2={960 + ARM} y2={pivotY} stroke="#6B5C42" strokeWidth={9} strokeLinecap="round" />
          <line x1={960 - ARM} y1={pivotY - 3} x2={960 + ARM} y2={pivotY - 3} stroke="#A98C5E" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        </g>
        {/* 左盘：付出 */}
        <g
          transform={`translate(${960 + lx - 440 * panOut},${pivotY + ly + 320 * panOut}) rotate(${-16 * panOut})`}
          opacity={1 - panOut * 1.05}
        >
          {/* 吊绳从横梁端点（0,0）分出，斜拉到盘沿两侧 —— 起手就咬在杆子上，不会错位 */}
          <line x1={0} y1={0} x2={-96} y2={92} stroke="#574B39" strokeWidth={2.6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={96} y2={92} stroke="#574B39" strokeWidth={2.6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={-96} y2={92} stroke="#9C8256" strokeWidth={1} strokeLinecap="round" opacity={0.35} />
          <line x1={0} y1={0} x2={96} y2={92} stroke="#9C8256" strokeWidth={1} strokeLinecap="round" opacity={0.35} />
          {/* 端点挂钩 */}
          <circle cx={0} cy={0} r={6} fill="#3B3428" />
          <circle cx={0} cy={0} r={6} fill="none" stroke="#8A7350" strokeWidth={2} />
          <circle cx={-1.4} cy={-1.6} r={1.8} fill="#D8BC8A" opacity={0.7} />
          {/* 盘体：浅碟（底带弧），不是纸箱 */}
          <path d="M-104 92 L104 92 L78 146 Q0 176 -78 146 Z" fill="#2C261A" />
          <path d="M-104 92 L104 92 L78 146 Q0 176 -78 146" fill="none" stroke="#5F4F38" strokeWidth={2.4} opacity={0.75} />
          <path d="M-86 114 Q0 142 86 114" fill="none" stroke="#8A6E48" strokeWidth={1.6} opacity={0.3} />
          {/* 盘沿 */}
          <ellipse cx={0} cy={92} rx={104} ry={13} fill="#17140E" />
          <ellipse cx={0} cy={92} rx={104} ry={13} fill="none" stroke="#8A6E48" strokeWidth={2.2} />
          <ellipse cx={0} cy={92} rx={92} ry={8.5} fill="#0B0906" opacity={0.55} />
          <path d="M-92 87 Q0 74 92 87" fill="none" stroke="#C89F66" strokeWidth={1.8} opacity={0.35} />
          <ellipse cx={0} cy={92} rx={98} ry={9} fill="#FFD79A" opacity={0.06} />
          {ROCKS.map((r, i) => {
            const p = drop(i);
            const oy = (1 - p) * -34;
            if (p < 0.02) return null;
            // 第 4 镜：整堆跟着盘子一起往下沉，别再往外"飞"
            const sink = worse ? 7 * interpolate(local, [2, 40], [0, 1], clamp) : 0;
            return (
              <g
                key={i}
                transform={`translate(${r.dx},${82 + r.dy + oy + sink}) rotate(${r.rot}) scale(${r.s})`}
                opacity={Math.min(1, p * 1.6)}
              >
                {i < 3 && <ellipse cx={2} cy={20} rx={26} ry={6} fill="#0A0906" opacity={0.3} />}
                <path d="M-34 -4 L-18 -26 L18 -30 L36 -8 L22 18 L-20 20 Z" fill={r.c} />
                <path d="M-34 -4 L-18 -26 L18 -30 L36 -8" fill="none" stroke="#7E6C4E" strokeWidth={1.8} opacity={0.4} />
                <path d="M-18 -26 L18 -30 L22 18" fill="none" stroke="#57492F" strokeWidth={1.4} opacity={0.3} />
              </g>
            );
          })}
        </g>
        {/* 右盘：结果 */}
        <g transform={`translate(${960 + rx},${pivotY + ry})`}>
          {/* 吊绳从横梁端点（0,0）分出，斜拉到盘沿两侧 —— 起手就咬在杆子上，不会错位 */}
          <line x1={0} y1={0} x2={-96} y2={92} stroke="#574B39" strokeWidth={2.6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={96} y2={92} stroke="#574B39" strokeWidth={2.6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={-96} y2={92} stroke="#9C8256" strokeWidth={1} strokeLinecap="round" opacity={0.35} />
          <line x1={0} y1={0} x2={96} y2={92} stroke="#9C8256" strokeWidth={1} strokeLinecap="round" opacity={0.35} />
          {/* 端点挂钩 */}
          <circle cx={0} cy={0} r={6} fill="#3B3428" />
          <circle cx={0} cy={0} r={6} fill="none" stroke="#8A7350" strokeWidth={2} />
          <circle cx={-1.4} cy={-1.6} r={1.8} fill="#D8BC8A" opacity={0.7} />
          {/* 盘体：浅碟（底带弧），不是纸箱 */}
          <path d="M-104 92 L104 92 L78 146 Q0 176 -78 146 Z" fill="#2C261A" />
          <path d="M-104 92 L104 92 L78 146 Q0 176 -78 146" fill="none" stroke="#5F4F38" strokeWidth={2.4} opacity={0.75} />
          <path d="M-86 114 Q0 142 86 114" fill="none" stroke="#8A6E48" strokeWidth={1.6} opacity={0.3} />
          {/* 盘沿 */}
          <ellipse cx={0} cy={92} rx={104} ry={13} fill="#17140E" />
          <ellipse cx={0} cy={92} rx={104} ry={13} fill="none" stroke="#8A6E48" strokeWidth={2.2} />
          <ellipse cx={0} cy={92} rx={92} ry={8.5} fill="#0B0906" opacity={0.55} />
          <path d="M-92 87 Q0 74 92 87" fill="none" stroke="#C89F66" strokeWidth={1.8} opacity={0.35} />
          <ellipse cx={0} cy={92} rx={98} ry={9} fill="#FFD79A" opacity={0.06} />
          {/* 那一粒：一颗很小的东西，本来就不起眼。位置固定，后面只是把它点亮 */}
          <ellipse cx={0} cy={88} rx={17} ry={4.5} fill="#080706" opacity={0.45} />
          <circle cx={0} cy={74} r={15} fill="#726A58" />
          <circle cx={0} cy={74} r={15} fill="none" stroke="#B29C77" strokeWidth={1.6} opacity={0.7} />
          <circle cx={-4.5} cy={67} r={6} fill="#DCC9A4" opacity={0.5} />
          <circle cx={-6} cy={65} r={3} fill="#FFF3DA" opacity={0.55} />
          {/* 点亮：同一颗、同一尺寸，只是被打上了光 —— 不是换了个东西 */}
          <g opacity={glowOp}>
            <circle cx={0} cy={74} r={150} fill="#FFC874" opacity={0.15} style={{filter: 'blur(80px)'}} />
            <circle
              cx={0}
              cy={74}
              r={15 + 17 * ripple}
              fill="none"
              stroke="#FFD79A"
              strokeWidth={2.2 * (1 - ripple)}
              opacity={(1 - ripple) * 0.42}
            />
            <Bloom blur={26} opacity={0.85}>
              <circle cx={0} cy={74} r={27} fill="#FFB85C" />
            </Bloom>
            <circle cx={0} cy={74} r={15} fill="#FFE3B4" />
            <circle cx={0} cy={74} r={8.5} fill="#FFF8EC" />
          </g>
          {/* 右盘的托盘亮一点，别整块黑 */}
          <ellipse cx={0} cy={94} rx={70} ry={8} fill={P.warm} opacity={0.07} style={{filter: 'blur(10px)'}} />
        </g>
      </g>
      <Motes local={local} n={30} color="rgba(255,238,210,0.3)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ================= 第 4 段：危害 ================= */

/* ---------------- 12 无处不在：同一机制的三个化身 ---------------- */
const MiniBowl: React.FC<{x: number; y: number; s?: number; opacity?: number; local: number}> = ({x, y, s = 1, opacity = 1, local}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <path d="M-88 0 L88 0 L64 58 Q0 82 -64 58 Z" fill="#4A3B24" />
    <path d="M-88 0 L88 0 L64 58 Q0 82 -64 58" fill="none" stroke="#8A6E48" strokeWidth={2} opacity={0.8} />
    <ellipse cx={0} cy={0} rx={88} ry={12} fill="#241C10" />
    <ellipse cx={0} cy={0} rx={88} ry={12} fill="none" stroke="#B08A5A" strokeWidth={2.4} />
    <ellipse cx={0} cy={-2} rx={72} ry={8} fill="#E8B25E" opacity={0.8} />
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${-22 + i * 22} -18 q 8 -18 0 -34 q -8 -16 0 -30`}
        fill="none"
        stroke="#FFE3B4"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.14 + 0.1 * Math.abs(Math.sin(local / 22 + i * 1.9))}
      />
    ))}
  </g>
);

const MiniBalance: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <path d="M-16 0 L16 0 L9 -118 L-9 -118 Z" fill="#57492F" />
    <g transform="rotate(-7 0 -124)">
      <line x1={-112} y1={-124} x2={112} y2={-124} stroke="#96805A" strokeWidth={8} strokeLinecap="round" />
      {[-112, 112].map((ex) => (
        <g key={ex}>
          <line x1={ex} y1={-124} x2={ex - 26} y2={-84} stroke="#8A7350" strokeWidth={2.6} />
          <line x1={ex} y1={-124} x2={ex + 26} y2={-84} stroke="#8A7350" strokeWidth={2.6} />
          <ellipse cx={ex} cy={-80} rx={34} ry={6} fill="#2A2114" stroke="#B08A5A" strokeWidth={2} />
        </g>
      ))}
    </g>
    <circle cx={0} cy={-124} r={7} fill="#3E362A" stroke="#A98C5E" strokeWidth={2} />
  </g>
);

const Everywhere: React.FC<S> = ({local}) => {
  const floor = 830;
  const spots = [
    {x: 470, beam: 300},
    {x: 960, beam: 330},
    {x: 1450, beam: 300},
  ];
  const rise = (i: number) => interpolate(local, [4 + i * 7, 18 + i * 7], [0, 1], clamp);
  return (
    <Svg bg="#050507">
      <Room cx={960} cy={470} bw={1750} bh={560} wall="#0D0D12" floor="#08080C" ceil="#0A0A0E" side="#0B0B0F" />
      {/* 更远处还有一排没点亮的——机制不只这三处 */}
      {[240, 620, 1300, 1720].map((x, i) => (
        <g key={x} opacity={0.34}>
          <polygon points={`${x - 26},90 ${x + 26},90 ${x + 92},${floor} ${x - 92},${floor}`} fill="#FFD79A" opacity={0.05} />
          <ellipse cx={x} cy={floor + 6} rx={86} ry={13} fill="#FFC874" opacity={0.05} style={{filter: 'blur(14px)'}} />
          <rect x={x - 26} y={floor - 74 - (i % 2) * 22} width={52} height={74 + (i % 2) * 22} fill="#0A0908" />
        </g>
      ))}
      {/* 三个化身：歪板凳 / 一碗面 / 歪天平 —— 观众在前面都见过 */}
      {spots.map((sp, i) => {
        const p = rise(i);
        const flick = 0.88 + 0.12 * Math.sin(local / 17 + i * 2.3);
        return (
          <g key={sp.x} opacity={p}>
            <polygon
              points={`${sp.x - 40},90 ${sp.x + 40},90 ${sp.x + sp.beam / 2},${floor} ${sp.x - sp.beam / 2},${floor}`}
              fill="#FFD79A"
              opacity={0.22 * flick}
            />
            <ellipse cx={sp.x} cy={floor + 8} rx={sp.beam / 2} ry={20} fill="#FFC874" opacity={0.16} style={{filter: 'blur(22px)'}} />
          </g>
        );
      })}
      <g opacity={rise(0)}>
        <Stool x={470} y={floor - 8} s={0.62} wob={Math.sin(local / 30) * 1.2} />
      </g>
      <g opacity={rise(1)}>
        <MiniBowl x={960} y={floor - 12} s={1.15} local={local} />
      </g>
      <g opacity={rise(2)}>
        <MiniBalance x={1450} y={floor - 6} s={1.1} />
      </g>
      <Motes local={local} n={26} color="rgba(255,238,210,0.26)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 13 咬你一口：发光的"值"，挂在钩上 ---------------- */
const HookScene: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  const reveal = interpolate(local, [5, 22], [0, 1], clamp); // 钩从光里显形
  const sway = Math.sin(local / 26) * 2.4;
  const pulse = 0.9 + 0.1 * Math.sin(local / 11);
  const cx = 960;
  const cy = 470;
  return (
    <Svg bg="#040405">
      {draft ? <DraftWater local={local} /> : null}
      {/* 全片第一处冷色：危险第一次出现 */}
      <ellipse cx={cx} cy={600} rx={520} ry={300} fill="#8FA3B8" opacity={0.045} style={{filter: 'blur(90px)'}} />
      <g transform={`rotate(${sway} ${cx} 0)`}>
        {/* 钓线从画面外的黑里垂下来 */}
        <line x1={cx} y1={-20} x2={cx} y2={cy - 60} stroke="#3A4048" strokeWidth={2.4} opacity={0.4 + 0.5 * reveal} />
        {/* 那一粒"值"：和第 3 段右盘里的是同一颗 */}
        <circle cx={cx} cy={cy} r={150} fill="#FFC874" opacity={0.13 * pulse} style={{filter: 'blur(70px)'}} />
        <Bloom blur={26} opacity={0.85}>
          <circle cx={cx} cy={cy} r={27} fill="#FFB85C" />
        </Bloom>
        <circle cx={cx} cy={cy} r={15} fill="#FFE3B4" />
        <circle cx={cx} cy={cy} r={8.5} fill="#FFF8EC" />
        {/* 钩：弯在饵的下方，钩尖从光里刺出去 */}
        <g opacity={reveal}>
          <path
            d={`M${cx} ${cy - 60} L${cx} ${cy + 26} C ${cx} ${cy + 78}, ${cx + 44} ${cy + 92}, ${cx + 66} ${cy + 52} L ${cx + 72} ${cy + 18}`}
            fill="none"
            stroke="#9AA3AE"
            strokeWidth={7}
            strokeLinecap="round"
          />
          {/* 倒刺 */}
          <line x1={cx + 72} y1={cy + 18} x2={cx + 54} y2={cy + 30} stroke="#9AA3AE" strokeWidth={5} strokeLinecap="round" />
          {/* 钩尖上的一点冷光 */}
          <circle cx={cx + 72} cy={cy + 18} r={3.4} fill="#DCE6F0" opacity={0.9} />
          <path
            d={`M${cx} ${cy - 60} L${cx} ${cy + 26} C ${cx} ${cy + 78}, ${cx + 44} ${cy + 92}, ${cx + 66} ${cy + 52}`}
            fill="none"
            stroke="#4A525C"
            strokeWidth={2.4}
            opacity={0.6}
          />
        </g>
      </g>
      <Motes local={local} n={20} color="rgba(210,224,240,0.22)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 14 难抽身：每放一块石头，人就往下沉一截 ---------------- */
const Sink: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  const step = (k: number) => interpolate(local, [k * 28 + 8, k * 28 + 20], [0, 1], clamp);
  const sink = 30 * (step(0) + step(1) + step(2) + step(3)); // 四拍沉四次，共 120px
  const settled = Math.min(4, Math.floor(Math.max(0, local - 16) / 28) + (local > 16 ? 1 : 0)); // 坑里已有几块
  const holding = local % 28 < 14 && settled < 4; // 前半拍怀里抱着，后半拍放进坑里
  const floor = 770;
  return (
    <Svg bg="#050507">
      {/* 不动的参照物：后墙与地平线——世界在下沉，是靠它们读出来的 */}
      <rect width={1920} height={floor} fill="#0B0B10" />
      <rect x={0} y={floor - 3} width={1920} height={3} fill="#FFD79A" opacity={0.12} />
      {draft ? <DraftShovel /> : null}
      <ellipse cx={420} cy={330} rx={260} ry={330} fill="#FFD79A" opacity={0.06} style={{filter: 'blur(90px)'}} />
      {/* 人身后垫一团暖光，剪影才从黑里分离得出来 */}
      <ellipse cx={830} cy={floor - 130} rx={240} ry={220} fill="#FFC874" opacity={0.09} style={{filter: 'blur(60px)'}} />
      {/* 下沉的世界：地面板 + 人 + 石头堆 + 坑 */}
      <g transform={`translate(0,${sink})`}>
        <rect x={380} y={floor} width={1160} height={90} fill="#0E0E14" />
        <rect x={380} y={floor} width={1160} height={4} fill="#C39A5C" opacity={0.38} />
        <ellipse cx={960} cy={floor + 88} rx={600} ry={26} fill="#000" opacity={0.55} style={{filter: 'blur(18px)'}} />
        {/* 坑：一个黑洞，吃的石头都进这里 */}
        <ellipse cx={1180} cy={floor + 6} rx={130} ry={20} fill="#020203" />
        <ellipse cx={1180} cy={floor + 6} rx={130} ry={20} fill="none" stroke="#3A332A" strokeWidth={2.4} opacity={0.8} />
        {draft ? <DraftPit /> : null}
        {/* 坑里已沉下去的石头：堆得越来越高 */}
        {ROCKS.slice(0, 4).map((r, i) =>
          i < settled ? (
            <g key={i} transform={`translate(${1180 + r.dx * 1.6},${floor + 2 - i * 16}) rotate(${r.rot}) scale(${r.s * 0.9})`}>
              <path d="M-34 -4 L-18 -26 L18 -30 L36 -8 L22 18 L-20 20 Z" fill={r.c} />
              <path d="M-34 -4 L-18 -26 L18 -30 L36 -8" fill="none" stroke="#7E6C4E" strokeWidth={1.8} opacity={0.4} />
            </g>
          ) : null
        )}
        {/* 人：前倾，怀里抱着下一块 */}
        <g transform={`translate(830,${floor})`}>
          <ellipse cx={0} cy={4} rx={52} ry={10} fill="#000" opacity={0.5} style={{filter: 'blur(7px)'}} />
          <Person x={0} y={0} s={1.3} color="#0C0C12" rim="rgba(255,232,196,0.5)" lean={10} />
          {holding ? (
            <g transform="translate(58,-96) rotate(8)">
              <path d="M-34 -4 L-18 -26 L18 -30 L36 -8 L22 18 L-20 20 Z" fill="#514532" />
              <path d="M-34 -4 L-18 -26 L18 -30 L36 -8" fill="none" stroke="#7E6C4E" strokeWidth={1.8} opacity={0.4} />
            </g>
          ) : null}
        </g>
        {/* 旁边没搬完的石头堆 */}
        <g transform="translate(560,0)">
          {ROCKS.map((r, i) => (
            <g key={i} transform={`translate(${r.dx},${floor - 6 + r.dy - (i > 2 ? 26 : 0)}) rotate(${r.rot}) scale(${r.s})`}>
              <path d="M-34 -4 L-18 -26 L18 -30 L36 -8 L22 18 L-20 20 Z" fill={r.c} opacity={0.85} />
            </g>
          ))}
        </g>
      </g>
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 15 筹码：推出去的是钱，叠起来的是墙 ---------------- */
const Chip: React.FC<{x: number; y: number; c?: string}> = ({x, y, c = '#8A5A34'}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-30} y={-9} width={60} height={9} fill="#5C3B20" />
    <ellipse cx={0} cy={-9} rx={30} ry={9} fill={c} />
    <ellipse cx={0} cy={-9} rx={30} ry={9} fill="none" stroke="#D8B184" strokeWidth={1.6} opacity={0.8} />
    <ellipse cx={0} cy={-9} rx={15} ry={4.4} fill="none" stroke="#F0D2A6" strokeWidth={1.2} opacity={0.5} />
  </g>
);

const Chips: React.FC<S> = ({local, mode = 'push'}) => {
  const draft = React.useContext(DraftCtx);
  if (mode === 'wall') {
    // 平视：推出去的筹码在人和门之间叠成一排栏杆
    const floor = 880;
    const cols = [640, 790, 940, 1090, 1240];
    const up = (k: number) => interpolate(local, [k * 20 + 4, k * 20 + 16], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
    return (
      <Svg bg="#050507">
        <Room cx={960} cy={500} bw={1780} bh={620} wall="#0C0C11" floor="#08080C" ceil="#0A0A0E" side="#0A0A0E" />
        {/* 远处左侧的门光：出口在那边 */}
        <rect x={150} y={430} width={190} height={450} fill={P.warm} opacity={0.85} />
        <Bloom blur={60} opacity={0.4}>
          <rect x={150} y={430} width={190} height={450} fill={P.warm} />
        </Bloom>
        <polygon points={`150,${floor} 340,${floor} 470,${floor + 140} 60,${floor + 140}`} fill="url(#gateSpill)" opacity={0.4} />
        {/* 人：朝着门，被定住。背后垫门方向来的光，剪影才立得住 */}
        <ellipse cx={1480} cy={floor - 140} rx={220} ry={240} fill="#FFC874" opacity={0.08} style={{filter: 'blur(56px)'}} />
        <g transform="translate(1480,0)">
          <ellipse cx={0} cy={floor + 4} rx={54} ry={10} fill="#000" opacity={0.5} style={{filter: 'blur(7px)'}} />
          <Person x={0} y={floor} s={1.35} color="#0C0C12" rim="rgba(255,232,196,0.5)" lean={4} />
        </g>
        {/* 筹码栏杆：一根接一根从地里升起来，把人和门隔开 */}
        {cols.map((x, i) => {
          const p = up(i);
          const h = 520 * p;
          return (
            <g key={x} transform={`translate(${x},${floor})`}>
              <rect x={-27} y={-h} width={54} height={h} fill="#4A2E18" />
              <rect x={-27} y={-h} width={54} height={h} fill="none" stroke="#8A5A34" strokeWidth={2} opacity={0.7} />
              {Array.from({length: Math.floor(h / 34)}).map((_, k) => (
                <line key={k} x1={-27} y1={-k * 34 - 30} x2={27} y2={-k * 34 - 30} stroke="#D8B184" strokeWidth={1.6} opacity={0.4} />
              ))}
              <ellipse cx={0} cy={-h} rx={27} ry={8} fill="#8A5A34" stroke="#D8B184" strokeWidth={1.6} opacity={0.95} />
            </g>
          );
        })}
        <Motes local={local} n={24} color="rgba(255,238,210,0.24)" />
        <rect width={1920} height={1080} fill="url(#fVig)" />
      </Svg>
    );
  }
  // push：斜俯视赌桌，一只手把筹码推进光里，光里的摞越叠越高
  const stackN = Math.min(5, Math.floor(local / 24) + 1);
  const pushT = (local % 24) / 24;
  const chipX = interpolate(pushT, [0.15, 0.7], [560, 940], clamp);
  const chipIn = pushT >= 0.15 && pushT < 0.7 && stackN < 6;
  return (
    <Svg bg="#050507">
      {/* 桌面 */}
      <polygon points="460,1080 1460,1080 1180,520 740,520" fill="#261B0E" />
      <polygon points="460,1080 1460,1080 1180,520 740,520" fill="none" stroke="#5C4628" strokeWidth={2.6} opacity={0.95} />
      <ellipse cx={960} cy={800} rx={560} ry={300} fill="#FFC874" opacity={0.1} style={{filter: 'blur(80px)'}} />
      {/* 推筹码那只手的位置也垫一点光 */}
      <ellipse cx={660} cy={900} rx={240} ry={110} fill="#FFC874" opacity={0.1} style={{filter: 'blur(40px)'}} />
      {/* 桌面中央的光区：筹码都往这里推 */}
      <ellipse cx={960} cy={760} rx={320} ry={160} fill="#FFC874" opacity={0.22} style={{filter: 'blur(46px)'}} />
      <ellipse cx={960} cy={760} rx={220} ry={105} fill="#FFD79A" opacity={0.16} style={{filter: 'blur(30px)'}} />
      {/* 已推出去的筹码摞：一层层叠高 */}
      {Array.from({length: stackN}).map((_, i) => (
        <Chip key={i} x={960} y={810 - i * 12} />
      ))}
      {/* 正在推的这一枚 */}
      {chipIn ? <Chip x={chipX} y={872 - (chipX - 560) * 0.16} c="#C88A52" /> : null}
      {/* 推筹码的手：只露手腕和指背 */}
      <g transform={`translate(${Math.min(chipX - 84, 560)},906) rotate(-8)`}>
        <path d="M-150 40 C-110 -10 -60 -30 0 -26 L30 -12 L24 22 L-40 34 Z" fill="#191420" />
        <path d="M-150 40 C-110 -10 -60 -30 0 -26" fill="none" stroke="rgba(255,232,196,0.8)" strokeWidth={3.2} />
        <path d="M-40 34 L24 22" fill="none" stroke="rgba(255,232,196,0.3)" strokeWidth={2.2} />
      </g>
      {draft ? <DraftTable /> : null}
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 16 骗局：上面递下饵，下面伸手去够 ---------------- */
const Offer: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  const cx = 1080;
  const cy = 430;
  const dip = interpolate(local, [10, 50], [0, 16], clamp); // 饵微微下沉，像在逗
  const reach = interpolate(local, [16, 60], [0, 14], clamp); // 下面的手缓缓上移
  const pulse = 0.9 + 0.1 * Math.sin(local / 10);
  return (
    <Svg bg="#040405">
      {draft ? <DraftScammer /> : null}
      <ellipse cx={cx} cy={cy} rx={560} ry={420} fill="#FFC874" opacity={0.05} style={{filter: 'blur(110px)'}} />
      {/* 上面的手臂：深色剪影，上下两道细轮廓光，才不会读成光柱或钓线 */}
      <g transform={`translate(0,${dip})`}>
        <path d="M1560 -40 C 1420 90, 1290 220, 1160 360" fill="none" stroke="#121118" strokeWidth={96} strokeLinecap="round" />
        <path d="M1612 -16 C 1470 116, 1340 244, 1206 386" fill="none" stroke="rgba(255,220,170,0.4)" strokeWidth={4} strokeLinecap="round" />
        <path d="M1510 -58 C 1372 66, 1244 194, 1118 336" fill="none" stroke="rgba(255,220,170,0.18)" strokeWidth={3} strokeLinecap="round" />
        {/* 捏住饵的两指：指侧被饵的光照亮 */}
        <path d={`M1140 356 Q ${cx - 24} ${cy - 40} ${cx - 12} ${cy - 22}`} fill="none" stroke="#121118" strokeWidth={28} strokeLinecap="round" />
        <path d={`M1140 356 Q ${cx - 24} ${cy - 40} ${cx - 12} ${cy - 22}`} fill="none" stroke="rgba(255,220,170,0.5)" strokeWidth={4} strokeLinecap="round" />
        <path d={`M1180 376 Q ${cx + 22} ${cy - 36} ${cx + 12} ${cy - 20}`} fill="none" stroke="#121118" strokeWidth={28} strokeLinecap="round" />
        <path d={`M1180 376 Q ${cx + 22} ${cy - 36} ${cx + 12} ${cy - 20}`} fill="none" stroke="rgba(255,220,170,0.5)" strokeWidth={4} strokeLinecap="round" />
        {/* 那一粒：全片唯一的光源 */}
        <circle cx={cx} cy={cy} r={170} fill="#FFC874" opacity={0.14 * pulse} style={{filter: 'blur(76px)'}} />
        <Bloom blur={26} opacity={0.85}>
          <circle cx={cx} cy={cy} r={27} fill="#FFB85C" />
        </Bloom>
        <circle cx={cx} cy={cy} r={15} fill="#FFE3B4" />
        <circle cx={cx} cy={cy} r={8.5} fill="#FFF8EC" />
      </g>
      {/* 下面的手：向上够，指尖还差一截 */}
      <g transform={`translate(0,${-reach})`}>
        <path d="M700 1120 C 760 940, 850 780, 980 640" fill="none" stroke="#0A0A0E" strokeWidth={72} strokeLinecap="round" />
        <path d="M980 640 Q 1030 560 1058 520" fill="none" stroke="#0A0A0E" strokeWidth={18} strokeLinecap="round" />
        <path d="M1000 656 Q 1062 588 1096 552" fill="none" stroke="#0A0A0E" strokeWidth={16} strokeLinecap="round" />
        <path d="M1006 678 Q 1076 626 1116 596" fill="none" stroke="#0A0A0E" strokeWidth={14} strokeLinecap="round" />
        {/* 指尖被饵的光照亮一点——它已经在"付出"了 */}
        <path d="M980 640 Q 1030 560 1058 520" fill="none" stroke="rgba(255,220,170,0.4)" strokeWidth={5} strokeLinecap="round" />
      </g>
      <Motes local={local} n={18} color="rgba(255,238,210,0.2)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 17 舍不得走：朝着门，脚踝上拴着那根线 ---------------- */
const Leash: React.FC<S> = ({local, mode = 'leash'}) => {
  const floor = 880;
  if (mode === 'line') {
    // 对策三：提前写下退出线——人弯腰在地上画一道发光的线，隔在自己和那堆筹码之间
    const draw = interpolate(local, [8, 58], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
    const chalkGlow = 0.5 + 0.5 * Math.sin(local / 6);
    return (
      <Svg bg="#050507">
        <Room cx={960} cy={500} bw={1780} bh={620} wall="#0C0C11" floor="#08080C" ceil="#0A0A0E" side="#0A0A0E" />
        {/* 门还亮着：这扇门现在是"想离开"的，但这一次，人先给自己画好了线 */}
        <rect x={1620} y={420} width={210} height={460} fill={P.warm} opacity={0.85} />
        <Bloom blur={64} opacity={0.4}>
          <rect x={1620} y={420} width={210} height={460} fill={P.warm} />
        </Bloom>
        <polygon points={`1620,${floor} 1830,${floor} 1920,${floor + 120} 1500,${floor + 120}`} fill="url(#gateSpill)" opacity={0.4} />
        {/* 左下那堆筹码还在——线就是画给它看的 */}
        <g transform="translate(250,0)">
          <ellipse cx={0} cy={floor + 40} rx={150} ry={20} fill="#000" opacity={0.5} style={{filter: 'blur(12px)'}} />
          {[0, 1, 2].map((i) => (
            <Chip key={i} x={-36 + i * 8} y={floor + 40 - i * 12} />
          ))}
          {[0, 1].map((i) => (
            <Chip key={'b' + i} x={44 + i * 6} y={floor + 42 - i * 12} c="#6E4626" />
          ))}
          <circle cx={6} cy={floor + 2} r={60} fill="#FFC874" opacity={0.1} style={{filter: 'blur(30px)'}} />
          <circle cx={6} cy={floor - 2} r={11} fill="#FFE3B4" />
          <circle cx={6} cy={floor - 2} r={6} fill="#FFF8EC" />
        </g>
        {/* 退出线：从左到右画出，就在人和筹码之间。线从手边起笔，手臂不用伸太长 */}
        <defs>
          <clipPath id="lineClip">
            <rect x={780} y={0} width={Math.max(0, 560 * draw)} height={1080} />
          </clipPath>
        </defs>
        <g clipPath="url(#lineClip)">
          <line x1={780} y1={floor - 150} x2={1340} y2={floor - 150} stroke="#FFC85C" strokeWidth={18} opacity={0.55} style={{filter: 'blur(10px)'}} />
          <line x1={780} y1={floor - 150} x2={1340} y2={floor - 150} stroke="#FFD79A" strokeWidth={6} opacity={0.95} />
          <line x1={780} y1={floor - 150} x2={1340} y2={floor - 150} stroke="#FFF8EC" strokeWidth={2.2} opacity={0.9} />
        </g>
        {/* 画线的笔尖处有一点光 */}
        <circle cx={780 + 560 * draw} cy={floor - 150} r={6} fill="#FFF8EC" opacity={draw > 0.02 ? 0.85 + 0.15 * chalkGlow : 0} />
        {/* 人：蹲下去画线的姿态（躯干沉低 + 前倾），小臂伸向笔尖 */}
        <ellipse cx={1120} cy={floor - 90} rx={220} ry={200} fill="#FFC874" opacity={0.13} style={{filter: 'blur(52px)'}} />
        <g transform="translate(1120,0)">
          <ellipse cx={0} cy={floor + 4} rx={54} ry={10} fill="#000" opacity={0.5} style={{filter: 'blur(7px)'}} />
          <Person x={0} y={floor + 46} s={1.35} color="#13131A" rim="rgba(255,232,196,0.55)" lean={24} />
          <path
            d={`M-30 ${floor - 64} C -70 ${floor - 20}, -160 ${floor + 6}, ${780 + 560 * draw - 1120} ${floor - 146}`}
            fill="none"
            stroke="#13131A"
            strokeWidth={26}
            strokeLinecap="round"
          />
          <path
            d={`M-30 ${floor - 64} C -70 ${floor - 20}, -160 ${floor + 6}, ${780 + 560 * draw - 1120} ${floor - 146}`}
            fill="none"
            stroke="rgba(255,232,196,0.35)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
        <Motes local={local} n={24} color="rgba(255,238,210,0.24)" />
        <rect width={1920} height={1080} fill="url(#fVig)" />
      </Svg>
    );
  }
  // 人朝门挪了两步，线绷直，人被定住
  const walk = interpolate(local, [4, 34], [0, 30], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const taut = interpolate(local, [18, 30], [0.25, 0.95], clamp); // 线越走越显形
  const tremble = Math.sin(local / 3.2) * 1.6 * taut; // 绷紧的线在颤
  const px = 1060 + walk;
  const doorFlick = 0.9 + 0.1 * Math.sin(local / 15);
  return (
    <Svg bg="#050507">
      <Room cx={960} cy={500} bw={1780} bh={620} wall="#0C0C11" floor="#08080C" ceil="#0A0A0E" side="#0A0A0E" />
      {/* 右侧的门：和第 2 段"想加入"的是同一种门，只是这次是想离开 */}
      <rect x={1620} y={420} width={210} height={460} fill={P.warm} opacity={0.9 * doorFlick} />
      <Bloom blur={64} opacity={0.42}>
        <rect x={1620} y={420} width={210} height={460} fill={P.warm} />
      </Bloom>
      <polygon points={`1620,${floor} 1830,${floor} 1920,${floor + 120} 1500,${floor + 120}`} fill="url(#gateSpill)" opacity={0.45} />
      {/* 左下暗处：那堆筹码和那粒还亮着的饵——线就拴在这儿 */}
      <g transform="translate(250,0)">
        <ellipse cx={0} cy={floor + 40} rx={150} ry={20} fill="#000" opacity={0.5} style={{filter: 'blur(12px)'}} />
        {[0, 1, 2].map((i) => (
          <Chip key={i} x={-36 + i * 8} y={floor + 40 - i * 12} />
        ))}
        {[0, 1].map((i) => (
          <Chip key={'b' + i} x={44 + i * 6} y={floor + 42 - i * 12} c="#6E4626" />
        ))}
        <circle cx={6} cy={floor + 2} r={60} fill="#FFC874" opacity={0.12} style={{filter: 'blur(30px)'}} />
        <circle cx={6} cy={floor - 2} r={11} fill="#FFE3B4" />
        <circle cx={6} cy={floor - 2} r={6} fill="#FFF8EC" />
      </g>
      {/* 那根线：从左下的饵，拴到人的脚踝 */}
      <path
        d={`M262 ${floor - 2} Q ${(262 + px) / 2} ${floor + 60 + tremble * 6} ${px + 6} ${floor - 26 + tremble}`}
        fill="none"
        stroke="#C9B490"
        strokeWidth={2.2}
        opacity={taut}
      />
      {/* 人：前倾朝门，但迈步被线拽住。门方向的暖光垫在背后 */}
      <ellipse cx={px + 60} cy={floor - 140} rx={230} ry={240} fill="#FFC874" opacity={0.09} style={{filter: 'blur(56px)'}} />
      <g transform={`translate(${px},0)`}>
        <ellipse cx={0} cy={floor + 4} rx={54} ry={10} fill="#000" opacity={0.5} style={{filter: 'blur(7px)'}} />
        <Person x={0} y={floor} s={1.35} color="#0C0C12" rim="rgba(255,232,196,0.52)" lean={9} />
        {/* 脚踝上的圈 */}
        <ellipse cx={6} cy={floor - 22} rx={14} ry={6} fill="none" stroke="#C9B490" strokeWidth={2.4} opacity={taut} />
      </g>
      <Motes local={local} n={24} color="rgba(255,238,210,0.24)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ================= 第 5 段：对策与收尾 ================= */

/* ---------------- 18 三个动作：三张卡片依次亮起 ---------------- */
const ACTIONS = [
  {k: '一', label: '拆掉付出', x: 520},
  {k: '二', label: '事前定价', x: 960},
  {k: '三', label: '写下退出线', x: 1400},
];

const Actions: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  return (
    <Svg bg="#050507">
    <ellipse cx={960} cy={560} rx={860} ry={430} fill="#FFC874" opacity={0.05} style={{filter: 'blur(100px)'}} />
    {ACTIONS.map((a, i) => {
      const lit = interpolate(local, [8 + i * 16, 22 + i * 16], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
      const glow = 0.85 + 0.15 * Math.sin(local / 12 + i * 2);
      return (
        <g key={a.k} opacity={0.25 + 0.75 * lit}>
          <ellipse cx={a.x} cy={560} rx={210} ry={260} fill="#FFC874" opacity={0.1 * lit * glow} style={{filter: 'blur(50px)'}} />
          <rect x={a.x - 170} y={330} width={340} height={470} rx={14} fill="#0E0D10" stroke="#3A332A" strokeWidth={2.4} />
          <rect x={a.x - 170} y={330} width={340} height={470} rx={14} fill="none" stroke="#C9A86A" strokeWidth={2.2} opacity={lit * 0.85} />
          <text
            x={a.x}
            y={452}
            textAnchor="middle"
            fill="#C9A86A"
            opacity={lit}
            style={{fontFamily: FONT, fontSize: 64, fontWeight: 700}}
          >
            {a.k}
          </text>
          <text
            x={a.x}
            y={700}
            textAnchor="middle"
            fill="#FFF3DA"
            opacity={lit}
            style={{fontFamily: FONT, fontSize: 44, fontWeight: 700, letterSpacing: 2}}
          >
            {a.label}
          </text>
          {/* 草稿：卡片背后浮现这张卡对应的微缩场景 */}
          {draft && lit > 0.4 ? (
            <g opacity={(lit - 0.4) * 0.9}>
              {i === 0 ? <MiniBalance x={a.x} y={632} s={0.42} /> : null}
              {i === 1 ? (
                <g transform={`translate(${a.x},596) rotate(-4)`}>
                  <rect x={-64} y={-36} width={128} height={72} rx={6} fill="#D9C9A6" opacity={0.85} />
                  <text x={0} y={16} textAnchor="middle" fill="#3A2C18" style={{fontFamily: '"Consolas", monospace', fontSize: 40, fontWeight: 700}}>
                    3.3
                  </text>
                </g>
              ) : null}
              {i === 2 ? (
                <g transform={`translate(${a.x},600)`}>
                  <rect x={-40} y={-66} width={80} height={118} fill={P.warm} opacity={0.5} />
                  <polygon points="-40,52 40,52 78,88 -78,88" fill="url(#gateSpill)" opacity={0.5} />
                </g>
              ) : null}
            </g>
          ) : null}
        </g>
      );
    })}
    <Motes local={local} n={22} color="rgba(255,238,210,0.24)" />
    <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 19 事前定价：先写下一个数，再谈付出 ---------------- */
const Price: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  const show = (i: number) => interpolate(local, [12 + i * 16, 22 + i * 16], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const penX = [820, 940, 1060];
  const digit = ['3', '.', '3'];
  return (
    <Svg bg="#070604">
      {/* 俯视暗桌面 */}
      <rect width={1920} height={1080} fill="#0B0806" />
      {draft ? <DraftDeskProps local={local} /> : null}
      {[
        [0, 270],
        [0, 560],
        [0, 880],
      ].map(([y, op]) => (
        <line key={y} x1={0} y1={y + 14} x2={1920} y2={y - 8} stroke="#1E160C" strokeWidth={3} opacity={op / 1000} />
      ))}
      <ellipse cx={700} cy={380} rx={460} ry={330} fill="#FFC874" opacity={0.07} style={{filter: 'blur(80px)'}} />
      {/* 空白卡片被一盏灯打亮 */}
      <ellipse cx={960} cy={560} rx={360} ry={250} fill="#FFD79A" opacity={0.1} style={{filter: 'blur(46px)'}} />
      <g transform="rotate(-4 960 560)">
        <rect x={720} y={420} width={480} height={280} rx={10} fill="#D9C9A6" />
        <rect x={720} y={420} width={480} height={280} rx={10} fill="none" stroke="#8A7350" strokeWidth={2.4} opacity={0.7} />
        <rect x={720} y={420} width={480} height={280} rx={10} fill="#000" opacity={0.06} />
        {/* 数字被一位一位写下：先定价，再吃面 */}
        {digit.map((d, i) => (
          <text
            key={i}
            x={860 + i * 90}
            y={620}
            textAnchor="middle"
            fill="#3A2C18"
            opacity={show(i)}
            transform={`translate(0,${(1 - show(i)) * 8})`}
            style={{fontFamily: '"Consolas", monospace', fontSize: 108, fontWeight: 700}}
          >
            {d}
          </text>
        ))}
        <text x={1068} y={486} textAnchor="start" fill="#6E5836" opacity={0.8} style={{fontFamily: FONT, fontSize: 30, letterSpacing: 2}}>
          它值多少
        </text>
      </g>
      {/* 一支笔跟着数字走（画外的手） */}
      <g transform={`translate(${penX[Math.min(2, Math.max(0, Math.floor((local - 12) / 16)))]},${630 + Math.sin(local / 8) * 3}) rotate(-18)`}>
        <rect x={-14} y={-120} width={28} height={150} rx={10} fill="#141017" />
        <path d="M-6 30 L0 52 L6 30 Z" fill="#2C2016" />
        <circle cx={0} cy={52} r={3} fill="#0A0A0A" />
        <rect x={-14} y={-96} width={28} height={10} fill="#3A2C1A" opacity={0.7} />
      </g>
      {/* 右下角：那碗面还在暗处等——先定价，再付出 */}
      <ellipse cx={1650} cy={985} rx={250} ry={120} fill="#FFC874" opacity={0.06} style={{filter: 'blur(30px)'}} />
      <ellipse cx={1680} cy={990} rx={240} ry={110} fill="#000" opacity={0.4} style={{filter: 'blur(18px)'}} />
      <g transform="translate(1680,990) rotate(-14)">
        <path d="M-150 0 L150 0 L112 92 Q0 128 -112 92 Z" fill="#2A231A" />
        <ellipse cx={0} cy={0} rx={150} ry={20} fill="#191410" />
        <ellipse cx={0} cy={0} rx={150} ry={20} fill="none" stroke="#7A6242" strokeWidth={2.6} />
      </g>
      <Motes local={local} n={18} color="rgba(255,238,210,0.2)" />
      <rect width={1920} height={1080} fill="url(#fVig)" />
    </Svg>
  );
};

/* ---------------- 20 修好板凳：让努力改变事情 ---------------- */
const Mend: React.FC<S> = ({local}) => {
  const draft = React.useContext(DraftCtx);
  const floorY = 800;
  const ignite = interpolate(local, [0, 12], [0, 1], {...clamp, easing: (x) => x * x});
  const calm = Math.min(1, Math.max(0, (local - 30) / 30)); // 修好以后光不再晃
  const flick = 1 - calm * 0.7 * (1 - (0.9 + 0.1 * Math.sin(local / 6.1)));
  const fix = interpolate(local, [26, 58], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const blockIn = interpolate(local, [24, 46], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const handsIn = interpolate(local, [8, 18], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const handsOut = interpolate(local, [56, 74], [1, 0], {...clamp, easing: (x) => x * x});
  const hands = handsIn * handsOut;
  const fadeOut = interpolate(local, [196, 222], [0, 1], clamp);
  // 板凳由歪转正：wob 从晃动的 −3 回到 0
  const wob = (Math.sin(local / 8.5) * 0.7 - 3) * (1 - fix);
  // 第 4 条腿（锯短的那条，屏右侧）下面垫一块木片
  const legX = 960 + 233 * 1.28;
  const legY = floorY + (-62) * 1.28;
  return (
    <Svg bg="#050507">
      <rect y={floorY} width={1920} height={280} fill="#07070A" />
      {draft ? <DraftWorkshop /> : null}
      <g opacity={ignite * (1 - fadeOut)}>
        <g style={{filter: 'blur(30px)'}} opacity={flick}>
          <polygon points="872,-60 1048,-60 1360,800 560,800" fill="#FFD79A" opacity={0.09} />
          <polygon points="908,-60 1012,-60 1250,800 680,800" fill="#FFD79A" opacity={0.13} />
        </g>
        <ellipse cx={965} cy={470} rx={340} ry={86} fill={P.warm} opacity={0.1 * flick} style={{filter: 'blur(52px)'}} />
        <ellipse cx={960} cy={floorY + 2} rx={420} ry={56} fill={P.warm} opacity={0.12 * flick} style={{filter: 'blur(48px)'}} />
        {/* 双手：前臂斜上，手掌是一个圆团，别画成桌腿 */}
        {hands > 0.02 ? (
          <g opacity={hands}>
            <path d="M500 960 C 570 820, 640 700, 706 652" fill="none" stroke="#0B0B11" strokeWidth={76} strokeLinecap="round" />
            <circle cx={706} cy={652} r={46} fill="#0B0B11" />
            <rect x={690} y={600} width={26} height={40} rx={12} fill="#0B0B11" transform="rotate(-24 703 620)" />
            <path d="M524 944 C 588 812, 652 704, 712 660" fill="none" stroke="rgba(255,232,196,0.22)" strokeWidth={3} strokeLinecap="round" />
            <path d="M1420 960 C 1360 824, 1296 706, 1218 656" fill="none" stroke="#0B0B11" strokeWidth={76} strokeLinecap="round" />
            <circle cx={1218} cy={656} r={46} fill="#0B0B11" />
            <rect x={1204} y={604} width={26} height={40} rx={12} fill="#0B0B11" transform="rotate(22 1217 624)" />
            <path d="M1396 944 C 1340 816, 1284 710, 1212 662" fill="none" stroke="rgba(255,232,196,0.22)" strokeWidth={3} strokeLinecap="round" />
          </g>
        ) : null}
        {/* 垫进短腿下面的木片 */}
        <g transform={`translate(${legX + (1 - blockIn) * 140},${legY - 24}) rotate(${-8 * (1 - blockIn)})`} opacity={blockIn}>
          <rect x={-38} y={0} width={76} height={26} rx={4} fill="#7C5331" />
          <rect x={-38} y={0} width={76} height={26} rx={4} fill="none" stroke="#A67445" strokeWidth={2} opacity={0.8} />
          <line x1={-30} y1={8} x2={30} y2={8} stroke="#4A3018" strokeWidth={2} opacity={0.6} />
        </g>
        <Stool x={960} y={floorY} s={1.28} wob={wob} />
        {draft ? <DraftOldStool /> : null}
        <Motes local={local} n={54} color="rgba(255,238,210,0.5)" />
      </g>
      <rect width={1920} height={1080} fill="url(#fVig)" />
      {/* 最后一镜：光慢慢熄掉，全片收尾 */}
      <rect width={1920} height={1080} fill="#000" opacity={fadeOut} />
    </Svg>
  );
};

/* ================= 草稿第二轮：密度实验（只进 EffortDraft，不进正片） ================= */

/** 工作间：吊灯、挂墙工具、木料堆、锯末 —— 开场板凳与收尾修板凳共用 */
const DraftWorkshop: React.FC = () => (
  <>
    {/* 吊灯：光锥从这里下来 */}
    <g>
      <line x1={960} y1={-10} x2={960} y2={64} stroke="#1A1814" strokeWidth={6} />
      <path d="M894 64 Q960 36 1026 64 L1056 122 L864 122 Z" fill="#17140F" />
      <path d="M894 64 Q960 36 1026 64" fill="none" stroke="#3A3226" strokeWidth={3} opacity={0.8} />
      <ellipse cx={960} cy={122} rx={100} ry={12} fill="#FFD79A" opacity={0.28} style={{filter: 'blur(6px)'}} />
    </g>
    {/* 左墙工具挂板：锯 / 锤 / 刨 */}
    <g opacity={0.55}>
      <rect x={96} y={210} width={330} height={430} rx={8} fill="#0C0B0F" stroke="#1E1A16" strokeWidth={3} />
      <g transform="translate(172,302) rotate(-8)">
        <path d="M-13 0 L13 0 L9 118 L-9 118 Z" fill="#1A1611" />
        <path d="M-9 118 L9 118 L0 166 Z" fill="#242018" />
        <path d="M-9 118 L9 118 L0 166 Z" fill="none" stroke="#3A3226" strokeWidth={2} />
      </g>
      <g transform="translate(284,322) rotate(6)">
        <rect x={-8} y={0} width={16} height={150} rx={6} fill="#1A1611" />
        <rect x={-40} y={-26} width={80} height={40} rx={8} fill="#221D16" />
      </g>
      <g transform="translate(372,478) rotate(-4)">
        <rect x={-46} y={-16} width={92} height={44} rx={8} fill="#1C1812" />
        <path d="M-20 -16 Q0 -52 20 -16 Z" fill="#252016" />
      </g>
    </g>
    {/* 左下木料堆 */}
    <g transform="translate(150,864)" opacity={0.8}>
      <rect x={-90} y={-30} width={240} height={34} rx={6} fill="#15110C" />
      <rect x={-70} y={-62} width={200} height={32} rx={6} fill="#1B1610" />
      <rect x={-90} y={-30} width={240} height={34} rx={6} fill="none" stroke="#2E271C" strokeWidth={2} />
    </g>
    {/* 地面锯末 */}
    {Array.from({length: 26}).map((_, i) => (
      <rect
        key={i}
        x={560 + ((i * 137) % 780)}
        y={830 + ((i * 71) % 60)}
        width={5}
        height={2.4}
        rx={1}
        fill="#3A2F20"
        opacity={0.4 + (i % 3) * 0.15}
      />
    ))}
  </>
);

/** 收尾专用：旁边还倚着一只没修的旧歪凳 */
const DraftOldStool: React.FC = () => (
  <g transform="translate(1660,872) scale(0.72) rotate(9)" opacity={0.5}>
    <Stool x={0} y={0} s={1} wob={0} />
  </g>
);

/** 大脑改价：头周围漂浮的记忆碎片（排过的队 / 那碗面 / 正字 / 筹码） */
const DraftMemories: React.FC<{local: number}> = ({local}) => {
  const bits = [
    {x: 720, y: 210, kind: 'stool'},
    {x: 960, y: 158, kind: 'bowl'},
    {x: 1190, y: 250, kind: 'tally'},
    {x: 850, y: 320, kind: 'queue'},
    {x: 1100, y: 356, kind: 'chip'},
  ];
  return (
    <g>
      {bits.map((b, i) => {
        const bob = Math.sin(local / 30 + i * 1.7) * 9;
        const rot = Math.sin(local / 40 + i * 0.9) * 4;
        return (
          <g key={i} transform={`translate(${b.x},${b.y + bob}) rotate(${rot})`} opacity={0.4}>
            <rect x={-56} y={-44} width={112} height={88} rx={12} fill="#131117" stroke="#37302A" strokeWidth={2} />
            {b.kind === 'stool' ? (
              <g transform="scale(0.13) translate(0,300)">
                <Stool x={0} y={0} s={1} wob={0} />
              </g>
            ) : null}
            {b.kind === 'bowl' ? <MiniBowl x={0} y={22} s={0.3} local={local} /> : null}
            {b.kind === 'tally' ? (
              <g stroke="#8A7350" strokeWidth={3} strokeLinecap="round">
                <line x1={-26} y1={-14} x2={-26} y2={16} />
                <line x1={-10} y1={-14} x2={-10} y2={16} />
                <line x1={6} y1={-14} x2={6} y2={16} />
                <line x1={22} y1={-14} x2={22} y2={16} />
                <line x1={-32} y1={12} x2={30} y2={-12} />
              </g>
            ) : null}
            {b.kind === 'queue' ? (
              <g stroke="#7A6544" strokeWidth={3} strokeLinecap="round" fill="none">
                <path d="M-28 14 L-28 -4 Q-28 -20 -12 -20 Q4 -20 4 -4 L4 14" />
                <line x1={-36} y1={-8} x2={12} y2={-8} />
                <path d="M16 16 L16 2 Q16 -10 28 -10 Q40 -10 40 2 L40 16" opacity={0.7} />
              </g>
            ) : null}
            {b.kind === 'chip' ? <Chip x={0} y={8} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/** 波形房间：两侧音箱 + 底部深色过渡（无线，避免"切一刀"） */
const DraftListen: React.FC = () => (
  <>
    <rect x={0} y={860} width={1920} height={220} fill="url(#fDeep)" />
    <g opacity={0.75}>
      <rect x={58} y={330} width={150} height={440} rx={14} fill="#0C0B10" stroke="#232028" strokeWidth={3} />
      <circle cx={133} cy={470} r={44} fill="#070609" stroke="#2A2630" strokeWidth={4} />
      <circle cx={133} cy={470} r={16} fill="#0D0B10" />
      <circle cx={133} cy={632} r={26} fill="#070609" stroke="#2A2630" strokeWidth={3} />
      <rect x={1712} y={330} width={150} height={440} rx={14} fill="#0C0B10" stroke="#232028" strokeWidth={3} />
      <circle cx={1787} cy={470} r={44} fill="#070609" stroke="#2A2630" strokeWidth={4} />
      <circle cx={1787} cy={470} r={16} fill="#0D0B10" />
      <circle cx={1787} cy={632} r={26} fill="#070609" stroke="#2A2630" strokeWidth={3} />
    </g>
  </>
);

/** 钩：水下感 —— 顶部水面光团、涟漪扩散、深处渐变 */
const DraftWater: React.FC<{local: number}> = ({local}) => (
  <>
    <rect x={0} y={700} width={1920} height={380} fill="url(#fDeep)" />
    <ellipse
      cx={960 + Math.sin(local / 30) * 60}
      cy={64}
      rx={640}
      ry={86}
      fill="#8FA3B8"
      opacity={0.075}
      style={{filter: 'blur(60px)'}}
    />
    {[0, 1, 2].map((i) => {
      const t = ((local + i * 26) % 78) / 78;
      return (
        <ellipse
          key={i}
          cx={960}
          cy={470}
          rx={70 + t * 430}
          ry={26 + t * 150}
          fill="none"
          stroke="#8FA3B8"
          strokeWidth={2}
          opacity={0.2 * (1 - t)}
        />
      );
    })}
  </>
);

/** 递饵：骗局有轮廓（肩与帽沿一角），伸手的人露出仰起的脸 */
const DraftScammer: React.FC = () => (
  <>
    <g opacity={0.85}>
      <path d="M1920 0 L1920 250 C 1770 226, 1680 150, 1652 24 L1696 0 Z" fill="#08080C" />
      <path d="M1652 24 C 1680 150, 1770 226, 1920 250" fill="none" stroke="rgba(255,220,170,0.16)" strokeWidth={3} />
    </g>
    <g transform="translate(610,1020)" opacity={0.92}>
      <path d="M-170 80 C-148 -46, -64 -120, 0 -130 C 64 -120, 148 -46, 170 80 Z" fill="#0A0A0E" />
      <ellipse cx={8} cy={-162} rx={41} ry={47} fill="#0A0A0E" transform="rotate(-15 8 -162)" />
      <path d="M-170 80 C-148 -46, -64 -120, 0 -130" fill="none" stroke="rgba(255,220,170,0.18)" strokeWidth={3} />
      <ellipse cx={8} cy={-162} rx={41} ry={47} fill="none" stroke="rgba(255,220,170,0.3)" strokeWidth={2.4} transform="rotate(-15 8 -162)" />
      {/* 仰望的视线 */}
      <line x1={24} y1={-176} x2={60} y2={-196} stroke="rgba(255,220,170,0.35)" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  </>
);

/** 赌桌：台灯、散落的筹码、对面空椅背 */
const DraftTable: React.FC = () => (
  <>
    <g>
      <path d="M430 1080 L524 890 L566 908 L478 1080 Z" fill="#0E0C10" />
      <line x1={480} y1={886} x2={618} y2={838} stroke="#17130E" strokeWidth={14} strokeLinecap="round" />
      <path d="M566 806 L688 838 L646 898 L546 868 Z" fill="#17130E" />
      <path d="M566 806 L688 838" stroke="#3A3226" strokeWidth={2.4} opacity={0.7} />
      <ellipse cx={612} cy={876} rx={64} ry={20} fill="#FFD79A" opacity={0.3} style={{filter: 'blur(10px)'}} />
    </g>
    <Chip x={770} y={1002} />
    <Chip x={836} y={1034} c="#6E4626" />
    <Chip x={1190} y={1014} />
    <Chip x={1252} y={1044} c="#6E4626" />
    {/* 对面空椅背：贴着桌面远沿，别悬在桌外 */}
    <g transform="translate(1330,612)" opacity={0.5} style={{filter: 'blur(2.5px)'}}>
      <rect x={-110} y={-150} width={220} height={200} rx={26} fill="#0B090D" />
      <rect x={-110} y={-150} width={220} height={200} rx={26} fill="none" stroke="#221C16" strokeWidth={4} />
      <rect x={-94} y={-134} width={188} height={38} rx={18} fill="#131009" />
    </g>
  </>
);

/** 事前定价的桌面：木纹、茶杯、便签、手机 */
const DraftDeskProps: React.FC<{local: number}> = ({local}) => (
  <>
    {[120, 300, 700, 940].map((y, i) => (
      <path key={i} d={`M0 ${y} C 420 ${y - 18}, 1220 ${y + 16}, 1920 ${y - 10}`} stroke="#1C140C" strokeWidth={2.4} fill="none" opacity={0.9} />
    ))}
    <g transform="translate(300,296)">
      <ellipse cx={0} cy={58} rx={66} ry={14} fill="#000" opacity={0.4} style={{filter: 'blur(6px)'}} />
      <path d="M-52 0 L52 0 L44 58 Q0 74 -44 58 Z" fill="#241C13" />
      <ellipse cx={0} cy={0} rx={52} ry={11} fill="#131009" />
      <ellipse cx={0} cy={0} rx={52} ry={11} fill="none" stroke="#4E3E2C" strokeWidth={2.2} />
      <path
        d="M-14 -18 q 8 -20 0 -40 q -8 -18 0 -34"
        stroke="#FFE3B4"
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
        opacity={0.2 + 0.12 * Math.abs(Math.sin(local / 20))}
      />
    </g>
    <g transform="translate(1560,296) rotate(6)" opacity={0.85}>
      <rect x={-70} y={-50} width={140} height={100} rx={4} fill="#2B2117" />
      <line x1={-46} y1={-16} x2={46} y2={-16} stroke="#4C3D2A" strokeWidth={3} />
      <line x1={-46} y1={8} x2={28} y2={8} stroke="#4C3D2A" strokeWidth={3} />
    </g>
    <g transform="translate(380,906) rotate(-9)" opacity={0.9}>
      <rect x={-60} y={-110} width={120} height={220} rx={16} fill="#0C0A08" />
      <rect x={-60} y={-110} width={120} height={220} rx={16} fill="none" stroke="#262019" strokeWidth={3} />
    </g>
  </>
);

/** 下沉：坑沿翻出的土堆（随世界一起沉）、墙根的铁锹（不动） */
const DraftPit: React.FC = () => (
  <>
    <g opacity={0.85}>
      <ellipse cx={1082} cy={770} rx={70} ry={18} fill="#100D08" />
      <ellipse cx={1288} cy={772} rx={56} ry={15} fill="#0E0B07" />
      <ellipse cx={1172} cy={756} rx={48} ry={13} fill="#131009" />
    </g>
  </>
);

const DraftShovel: React.FC = () => (
  <g transform="translate(1560,430) rotate(14)" opacity={0.5}>
    <rect x={-5} y={0} width={10} height={330} rx={4} fill="#1A1611" />
    <path d="M-26 330 L26 330 L18 400 Q0 414 -18 400 Z" fill="#211C15" />
    <path d="M-14 -26 Q0 -40 14 -26" fill="none" stroke="#1A1611" strokeWidth={9} strokeLinecap="round" />
  </g>
);

export const FAST_SCENES: Record<string, React.FC<S>> = {
  ask1: Ask1,
  ask2: Ask2,
  crowd: Crowd,
  lab: Lab,
  gates: Screening,
  waves: ThreeWaves,
  bars: Bars,
  tape: TapeFast,
  corridor: CorridorFast,
  street: Street,
  queue: Queue,
  counter: Counter,
  bowl: Bowl,
  brain: Brain,
  title: Title,
  slam: Slam,
  desk: Desk,
  profile: Profile,
  scale: ScaleFast,
  balance: Balance,
  pillars: PillarsFast,
  flash: Flash,
  everywhere: Everywhere,
  hook: HookScene,
  sink: Sink,
  chips: Chips,
  offer: Offer,
  leash: Leash,
  actions: Actions,
  price: Price,
  mend: Mend,
};
