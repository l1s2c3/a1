import React from 'react';
import {interpolate, spring} from 'remotion';
import {P} from './palette';
import {Beam, Bloom, Hud, Motes, Person, rnd, Room, Skyline, Ticks} from './prims';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

type S = {local: number; dur: number};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#131319" />
        <stop offset="100%" stopColor="#0C0C10" />
      </linearGradient>
      <linearGradient id="warmFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={P.warm} stopOpacity={0.30} />
        <stop offset="100%" stopColor={P.warm} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="coldFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={P.cold} stopOpacity={0.22} />
        <stop offset="100%" stopColor={P.cold} stopOpacity={0} />
      </linearGradient>
      <radialGradient id="doorCore" cx="0.5" cy="0.46" r="0.62">
        <stop offset="0%" stopColor="#FFFDF6" stopOpacity={1} />
        <stop offset="55%" stopColor="#FFF4DC" stopOpacity={0.55} />
        <stop offset="100%" stopColor="#FFF4DC" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#bgGrad)" />
    {children}
  </svg>
);

/* ---------------- 01 面馆排队 ---------------- */
const Shop: React.FC<S> = ({local}) => {
  const rain = Array.from({length: 70}, (_, i) => {
    const x = rnd(i, 1) * 1920;
    const y = ((local * 26 + rnd(i, 2) * 1080) % 1080) - 60;
    const len = 26 + rnd(i, 3) * 46;
    return <line key={i} x1={x} y1={y} x2={x - 4} y2={y + len} stroke="rgba(210,225,255,0.16)" strokeWidth={1.4} />;
  });

  return (
    <Svg>
      <Hud text="01 · 排队" right="城市 · 夜" />
      <Room cx={1040} cy={430} bw={1180} bh={600} wall="#1B1B23" floor="#15151A" ceil="#101014" side="#16161C" />
      {/* 店面：屋内亮，屋外暗 */}
      <g>
        <rect x={760} y={196} width={560} height={400} fill="#C9975F" />
        {/* 天花板 */}
        <rect x={760} y={196} width={560} height={58} fill="#8E6238" />
        {/* 后墙：更暖更亮 */}
        <rect x={760} y={254} width={560} height={216} fill="#DCAE74" />
        {/* 台面 */}
        <rect x={760} y={470} width={560} height={126} fill="#B7854F" />
        <rect x={760} y={470} width={560} height={8} fill="#7A5230" />
        {/* 吊灯 */}
        {[840, 1032, 1224].map((x) => (
          <g key={x}>
            <rect x={x - 2} y={196} width={4} height={40} fill="#6E4A2A" />
            <circle cx={x} cy={250} r={13} fill="#FFF6E2" />
            <circle cx={x} cy={250} r={26} fill="#FFE9BE" opacity={0.35} style={{filter: 'blur(14px)'}} />
          </g>
        ))}
        {/* 屋里的人：暗剪影，衬出纵深 */}
        {[880, 1006, 1150].map((x, i) => (
          <g key={x} opacity={0.85}>
            <circle cx={x} cy={402 - i * 4} r={19} fill="#5C3E24" />
            <path d={`M${x - 34} 470 C${x - 34} 424 ${x - 20} 410 ${x} 410 C${x + 20} 410 ${x + 34} 424 ${x + 34} 470 Z`} fill="#5C3E24" />
          </g>
        ))}
        {/* 吊着的菜牌 */}
        {[0, 1].map((i) => (
          <g key={i} opacity={0.5}>
            <rect x={930 + i * 118} y={268} width={86} height={56} fill="#7A5230" />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={940 + i * 118} y={280 + k * 14} width={62} height={5} fill="#C9975F" />
            ))}
          </g>
        ))}
        {/* 窗框 */}
        <rect x={760} y={396} width={560} height={10} fill="#4A3320" />
        <rect x={1035} y={196} width={10} height={400} fill="#4A3320" />
        <rect x={760} y={196} width={560} height={400} fill="none" stroke="#0D0D11" strokeWidth={14} />
        <Bloom blur={70} opacity={0.5}>
          <rect x={760} y={196} width={560} height={400} fill={P.warm} />
        </Bloom>
      </g>
      <rect x={760} y={596} width={560} height={14} fill="#0D0D11" />
      <Beam x={772} y={610} w={536} spread={2.2} height={1080} opacity={0.19} blur={60} />
      <ellipse cx={1040} cy={820} rx={430} ry={130} fill={P.warm} opacity={0.11} style={{filter: 'blur(40px)'}} />
      {/* 招牌 */}
      <rect x={690} y={132} width={700} height={46} fill="#0B0B0F" />
      <g opacity={0.85}>
        {Array.from({length: 4}, (_, i) => (
          <circle key={i} cx={760 + i * 172} cy={155} r={5.5} fill={P.warm} opacity={0.5} />
        ))}
      </g>
      {/* 排队的人：撑伞，从右往左，近大远小 */}
      {[
        {x: 1288, y: 986, s: 1.52, o: 0.72, u: 1, tilt: -4},
        {x: 1112, y: 1004, s: 1.66, o: 0.82, u: 0, tilt: 0},
        {x: 926, y: 1020, s: 1.8, o: 0.9, u: 1, tilt: 3},
        {x: 724, y: 1034, s: 1.94, o: 0.96, u: 0, tilt: 0},
        {x: 500, y: 1048, s: 2.1, o: 1, u: 1, tilt: -3},
      ].map((p, i) => (
        <g key={i} opacity={p.o}>
          {p.u ? (
            <g transform={`translate(${p.x},${p.y - 212 * p.s - 20}) rotate(${p.tilt})`}>
              {/* 伞柄：从伞心落到肩后 */}
              <path d="M0 -8 L0 96" stroke="#0B0B10" strokeWidth={7} />
              <path
                d="M-108 8 Q0 -108 108 8 Q0 30 -108 8 Z"
                fill="#08080C"
                stroke="rgba(244,212,164,0.45)"
                strokeWidth={2.6}
              />
              <path d="M0 -108 L0 -126" stroke="#08080C" strokeWidth={5} />
              <path d="M-108 8 Q-54 18 0 8" stroke="rgba(244,212,164,0.28)" strokeWidth={2} fill="none" />
            </g>
          ) : null}
          <Person x={p.x} y={p.y} s={p.s} color="#06060A" rim="rgba(244,212,164,0.22)" lean={i * 0.4} />
        </g>
      ))}
      {rain}
    </Svg>
  );
};

/* ---------------- 02 深夜的房间 ---------------- */
const Desk: React.FC<S> = ({local}) => (
  <Svg>
    <Hud text="02 · 03:00" right="某间屋子" />
    <Room cx={1000} cy={420} bw={1500} bh={720} wall="#171722" floor="#121218" ceil="#0F0F15" side="#131319" />
    {/* 桌上的杂物（远景剪影） */}
    <rect x={452} y={798} width={46} height={58} fill="#0C0C12" />
    <rect x={508} y={822} width={30} height={34} fill="#0C0C12" />
    <rect x={1560} y={812} width={64} height={44} fill="#0C0C12" />
    {/* 显示器 */}
    <g>
      <rect x={606} y={286} width={640} height={396} rx={8} fill={P.cold} opacity={0.94} />
      <Bloom blur={90} opacity={0.40}>
        <rect x={606} y={286} width={640} height={396} rx={8} fill={P.cold} />
      </Bloom>
      <g opacity={0.20}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={646} y={336 + i * 42} width={120 + ((i * 83) % 300)} height={12} fill="#1B2A42" />
        ))}
        <rect x={1090} y={336} width={112} height={250} fill="#1B2A42" opacity={0.7} />
      </g>
      <rect x={606} y={286} width={640} height={396} rx={8} fill="none" stroke="#08080C" strokeWidth={16} />
      {/* 支架 */}
      <rect x={902} y={682} width={48} height={128} fill="#08080C" />
      <rect x={812} y={806} width={228} height={14} rx={7} fill="#08080C" />
    </g>
    {/* 椅背 */}
    <path d="M1236 900 C1236 806 1272 762 1392 762 C1512 762 1548 806 1548 900 Z" fill="#0A0A10" />
    {/* 人：背影，只被屏幕的冷光勾边 */}
    <g transform="translate(1392,900)">
      <path d="M-146 0 C-146 -150 -96 -252 0 -252 C96 -252 146 -150 146 0 Z" fill="#07070B" />
      <circle cx={0} cy={-322} r={66} fill="#07070B" />
      <path d="M-146 -40 C-146 -168 -96 -252 0 -252" fill="none" stroke="rgba(150,190,240,0.26)" strokeWidth={3} />
      <path d="M0 -388 A66 66 0 0 1 0 -256" fill="none" stroke="rgba(150,190,240,0.22)" strokeWidth={3} />
    </g>
    {/* 桌面：盖住人物下半身，坐姿成立 */}
    <rect y={856} width={1920} height={224} fill="#191921" />
    <rect y={856} width={1920} height={5} fill="#2E2E3A" />
    {/* 屏幕在桌面上的反光 */}
    <polygon points="700,861 1150,861 1300,1080 520,1080" fill="url(#coldFloor)" opacity={0.85} />
    {/* 桌面右前方压暗，把人物推后 */}
    <rect x={1180} y={861} width={740} height={219} fill="#0D0D13" opacity={0.5} />
    <Motes local={local} n={44} color="rgba(185,210,245,0.6)" />
  </Svg>
);

/* ---------------- 03 片名底 ---------------- */
const VoidBg: React.FC<S> = ({local}) => (
  <Svg>
    <g opacity={0.5}>
      {Array.from({length: 9}, (_, i) => (
        <line key={i} x1={0} y1={200 + i * 80} x2={1920} y2={200 + i * 80} stroke="rgba(244,240,232,0.03)" strokeWidth={1} />
      ))}
    </g>
    <Motes local={local} n={70} color="rgba(232,203,160,0.55)" area={600} seed={9} />
    <Bloom blur={120} opacity={0.18}>
      <ellipse cx={960} cy={540} rx={520} ry={260} fill={P.warm} />
    </Bloom>
  </Svg>
);

/* ---------------- 04 三扇门 ---------------- */
const Corridor: React.FC<S> = ({local}) => {
  const openGlow = 0.78 + 0.22 * Math.sin(local / 26);
  return (
    <Svg>
      <Hud text="1959 · 实验室" right="ARONSON & MILLS" opacity={0} />
      <Room cx={960} cy={430} bw={1240} bh={640} wall="#15151B" floor="#141419" ceil="#0F0F13" side="#111116" guides guideColor="rgba(244,240,232,0.05)" />
      {/* 左：铁门，冷光 */}
      <g>
        <rect x={562} y={192} width={252} height={560} fill="#24272E" />
        <rect x={562} y={192} width={252} height={560} fill="none" stroke="#32373F" strokeWidth={5} />
        <rect x={562} y={192} width={13} height={560} fill="#9FB6CC" opacity={0.6} />
        <rect x={562} y={192} width={252} height={18} fill="#0E0E12" />
        <g stroke="#3E444D" strokeWidth={2} opacity={0.85}>
          {Array.from({length: 5}, (_, i) => (
            <line key={i} x1={590} y1={268 + i * 106} x2={786} y2={268 + i * 106} />
          ))}
        </g>
        <rect x={770} y={452} width={18} height={46} rx={4} fill="#5A636E" />
      </g>
      {/* 中：木门，暗 */}
      <g>
        <rect x={834} y={192} width={252} height={560} fill="#221F1F" />
        <rect x={834} y={192} width={252} height={560} fill="none" stroke="#2E2927" strokeWidth={5} />
        <rect x={834} y={192} width={252} height={18} fill="#0E0E12" />
        <rect x={856} y={240} width={208} height={200} fill="none" stroke="#2A2523" strokeWidth={3} />
        <rect x={856} y={470} width={208} height={240} fill="none" stroke="#2A2523" strokeWidth={3} />
        <circle cx={1058} cy={472} r={6} fill="#4E463D" />
      </g>
      {/* 右：敞开的门，暖光倾泻 */}
      <g>
        <rect x={1106} y={192} width={252} height={560} fill={P.warm} opacity={openGlow} />
        {/* 门里更亮的一层，做出纵深 */}
        <rect x={1156} y={246} width={152} height={452} fill="#FFF3DA" opacity={0.75 * openGlow} />
        <g stroke="rgba(255,252,240,0.5)" strokeWidth={2.5} opacity={0.6}>
          <line x1={1106} y1={192} x2={1156} y2={246} />
          <line x1={1358} y1={192} x2={1308} y2={246} />
          <line x1={1106} y1={752} x2={1156} y2={698} />
          <line x1={1358} y1={752} x2={1308} y2={698} />
        </g>
        <Bloom blur={96} opacity={0.45}>
          <rect x={1106} y={192} width={252} height={560} fill={P.warm} />
        </Bloom>
        <polygon points={`1106,752 1358,752 1650,1080 830,1080`} fill="url(#warmFloor)" opacity={0.45} />
        <rect x={1106} y={192} width={8} height={560} fill="#0E0E12" />
        <rect x={1350} y={192} width={8} height={560} fill="#0E0E12" />
      </g>
      <Motes local={local} n={44} color="rgba(255,238,210,0.6)" seed={5} />
    </Svg>
  );
};

/* ---------------- 05 磁带机 ---------------- */
const Tape: React.FC<S> = ({local}) => {
  const spin = local * 1.7;
  const vu = Array.from({length: 14}, (_, i) => 0.2 + 0.8 * Math.abs(Math.sin(local / (9 + i * 1.5) + i)));
  const REELS = [
    {cx: 660, dir: 1, r: 168},
    {cx: 1260, dir: 0.8, r: 168},
  ];
  return (
    <Svg>
      <Hud text="同一段录音" right="REEL  TO  REEL" opacity={0} />
      <Beam x={760} y={0} w={400} spread={3.2} opacity={0.07} height={860} />
      {/* 机身 */}
      <rect x={330} y={228} width={1260} height={610} rx={30} fill="#1B1B23" />
      <rect x={330} y={228} width={1260} height={610} rx={30} fill="none" stroke="#2C2C38" strokeWidth={3} />
      <rect x={330} y={228} width={1260} height={96} rx={30} fill="#141419" />
      <line x1={330} y1={324} x2={1590} y2={324} stroke="#2A2A34" strokeWidth={2} />
      {/* 品牌条 */}
      <g opacity={0.5}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={392 + i * 26} y={264} width={14} height={14} rx={3} fill={P.warm} />
        ))}
      </g>
      <text x={1548} y={276} textAnchor="end" fill="rgba(244,240,232,0.32)" style={{fontFamily: 'Consolas, monospace', fontSize: 17, letterSpacing: 4}}>
        MODEL  R-59
      </text>
      {/* 两个轮盘 */}
      {REELS.map(({cx, dir, r}) => (
        <g key={cx}>
          <circle cx={cx} cy={474} r={r + 10} fill="#12121A" />
          <circle cx={cx} cy={474} r={r + 10} fill="none" stroke="#33333F" strokeWidth={2.5} />
          {/* 盘好的磁带 */}
          <circle cx={cx} cy={474} r={r - 16} fill="#2A2118" />
          <circle cx={cx} cy={474} r={r - 16} fill="none" stroke="#3B2E20" strokeWidth={2} />
          <g transform={`rotate(${spin * dir} ${cx} 474)`}>
            {Array.from({length: 3}, (_, k) => {
              const a = (k / 3) * Math.PI * 2;
              const x1 = cx + Math.cos(a) * 56;
              const y1 = 474 + Math.sin(a) * 56;
              const x2 = cx + Math.cos(a) * (r - 26);
              const y2 = 474 + Math.sin(a) * (r - 26);
              return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4C3B29" strokeWidth={30} strokeLinecap="round" />;
            })}
            <circle cx={cx} cy={474} r={58} fill="#15151B" stroke="#4C3B29" strokeWidth={3} />
            <circle cx={cx} cy={474} r={16} fill={P.warm} opacity={0.9} />
            <Bloom blur={34} opacity={0.4}>
              <circle cx={cx} cy={474} r={16} fill={P.warm} />
            </Bloom>
          </g>
        </g>
      ))}
      {/* 磁带路径：左右轮之间的一段 */}
      <path d={`M660 ${474 + 152} L1260 ${474 + 152}`} stroke="#4A3C2E" strokeWidth={7} fill="none" />
      <path d={`M660 ${474 + 152} Q960 ${474 + 210} 1260 ${474 + 152}`} stroke="#3A2E22" strokeWidth={7} fill="none" opacity={0.7} />
      {/* 磁头组 */}
      <rect x={896} y={606} width={128} height={46} rx={6} fill="#0E0E14" stroke="#2E2E3A" strokeWidth={2} />
      <circle cx={930} cy={629} r={7} fill={P.warm} opacity={0.65} />
      <circle cx={990} cy={629} r={7} fill={P.warm} opacity={0.65} />
      {/* 电平表 */}
      <g>
        {vu.map((v, i) => (
          <rect key={i} x={586 + i * 26} y={790 - v * 58} width={12} height={v * 58} fill={i > 10 ? P.mint : P.warm} opacity={0.5 + v * 0.4} />
        ))}
      </g>
      <text x={584} y={820} fill="transparent" style={{fontFamily: 'Consolas, monospace', fontSize: 17, letterSpacing: 3}}>
        SAME  RECORDING  ·  THREE  GROUPS
      </text>
      <Motes local={local} n={30} color="rgba(255,238,210,0.5)" />
    </Svg>
  );
};

/* ---------------- 06 结果：三道光柱 ---------------- */
const BARS = [
  {v: 8.2, label: '高门槛', note: '「挺有意思」', c: '#E8B15C'},
  {v: 5.1, label: '低门槛', note: '「就那样吧」', c: '#CFC6B4'},
  {v: 3.3, label: '无门槛', note: '「浪费时间」', c: '#8E887C'},
];

const Pillars: React.FC<S> = ({local, dur}) => {
  const floor = 620;
  return (
    <Svg>
      <Hud text="对同一段录音的评价" right="评分 · 示意" />
      <Ticks y={floor} />
      {BARS.map((b, i) => {
        const p = spring({frame: local - 14 - i * 10, fps: 30, config: {damping: 28, mass: 0.9}});
        const h = 320 * (b.v / 8.2) * p;
        const cx = 580 + i * 380;
        const val = (b.v * p).toFixed(1);
        return (
          <g key={b.label}>
            <rect x={cx - 62} y={floor - h} width={124} height={h} fill={b.c} opacity={0.9} />
            <Bloom blur={50} opacity={0.45}>
              <rect x={cx - 62} y={floor - h} width={124} height={h} fill={b.c} />
            </Bloom>
            <rect x={cx - 62} y={floor - h} width={124} height={5} fill="#FFF6E6" opacity={0.95} />
            <text x={cx} y={floor - h - 30} textAnchor="middle" fill="#FFF1DC" style={{fontFamily: 'Consolas, monospace', fontSize: 52, fontWeight: 700}}>
              {val}
            </text>
            <text x={cx} y={floor + 86} textAnchor="middle" fill={P.ink} style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 34, fontWeight: 700}}>
              {b.label}
            </text>
            <text x={cx} y={floor + 128} textAnchor="middle" fill="rgba(244,240,232,0.55)" style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 23}}>
              {b.note}
            </text>
          </g>
        );
      })}
      <Motes local={local} n={26} color="rgba(255,238,210,0.4)" />
    </Svg>
  );
};

/* ---------------- 07 侧脸 ---------------- */
const PROFILE =
  'M120 700 C60 660 30 580 30 470 C30 330 140 230 285 230 C390 230 452 300 452 380 L452 420 L520 496 L448 512 L456 552 L404 566 L404 620 L452 700 Z';

const Profile: React.FC<S> = ({local}) => {
  const pulse = 0.6 + 0.4 * Math.sin(local / 18);
  return (
    <Svg>
      <Hud text="认知失调" right="COGNITIVE  DISSONANCE" />
      <g transform="translate(600,90) scale(1.16)">
        <path d="M10 940 C40 780 140 668 272 668 C402 668 512 786 560 940 Z" fill="#15151B" />
        <path d={PROFILE} fill="#15151B" />
        <path d={PROFILE} fill="none" stroke="rgba(244,240,232,0.12)" strokeWidth={3} />
        <ellipse cx={250} cy={430} rx={54 + pulse * 8} ry={44 + pulse * 6} fill={P.warm} opacity={0.55} />
        <Bloom blur={78} opacity={0.55}>
          <ellipse cx={250} cy={430} rx={54} ry={44} fill={P.warm} />
        </Bloom>
        {Array.from({length: 14}, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + local / 90;
          const r = 96 + Math.sin(local / 22 + i) * 12;
          return <circle key={i} cx={250 + Math.cos(a) * r} cy={430 + Math.sin(a) * r * 0.7} r={2.4} fill={P.warm} opacity={0.35} />;
        })}
      </g>
      <Motes local={local} n={24} color="rgba(255,238,210,0.45)" />
    </Svg>
  );
};

/* ---------------- 08 天平 ---------------- */
const Scale: React.FC<S> = ({local}) => {
  const tilt = -9 + Math.sin(local / 40) * 1.2;
  return (
    <Svg>
      <Hud text="它只会改价格" right="RE-EVALUATE" />
      <Beam x={860} y={0} w={220} spread={4} opacity={0.05} height={760} />
      <g transform="translate(960,760)">
        <line x1={0} y1={0} x2={0} y2={-330} stroke="#3A3A44" strokeWidth={9} />
        <ellipse cx={0} cy={0} rx={150} ry={16} fill="#22222A" />
        <g transform={`rotate(${tilt})`}>
          <line x1={-300} y1={-330} x2={300} y2={-330} stroke={P.warm} strokeWidth={7} strokeLinecap="round" />
          <circle cx={0} cy={-330} r={13} fill={P.warm} />
          <Bloom blur={40} opacity={0.5}>
            <circle cx={0} cy={-330} r={13} fill={P.warm} />
          </Bloom>
          {/* 左盘：重 */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <line x1={s * 300} y1={-330} x2={s * 300} y2={-268} stroke="rgba(244,240,232,0.35)" strokeWidth={2} />
              <path d={`M${s * 300 - 96} -268 L${s * 300 + 96} -268 L${s * 300 + 62} -198 L${s * 300 - 62} -198 Z`} fill="#1D1D25" stroke="#33333C" strokeWidth={2.5} />
            </g>
          ))}
          {/* 左盘堆叠的块：付出 */}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-362} y={-282 - i * 30} width={124} height={26} fill={P.warm} opacity={0.22 + i * 0.12} />
          ))}
          {/* 右盘：轻，一点微光 */}
          <circle cx={300} cy={-250} r={7} fill={P.mint} opacity={0.65} />
        </g>
      </g>
      <Motes local={local} n={26} color="rgba(255,238,210,0.4)" />
    </Svg>
  );
};

/* ---------------- 09 城市与藤蔓 ---------------- */
const Vine2: React.FC<{x: number; h: number; seed: number; local: number}> = ({x, h, seed, local}) => {
  const steps = 12;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const dx = Math.sin(t * 2.6 + seed) * 52 * (0.3 + t) + Math.sin(local / 40 + seed * 2 + t * 3) * 9 * t;
    pts.push(`${x + dx},${1010 - h * t}`);
  }
  const d = `M${pts.join(' L')}`;
  return (
    <g>
      <path d={d} stroke="#2E5C39" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#57A868" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.55} />
      {Array.from({length: 9}, (_, i) => {
        const t = 0.12 + (i / 8) * 0.86;
        const idx = Math.min(steps, Math.round(t * steps));
        const [px, py] = pts[idx].split(',').map(Number);
        const side = i % 2 ? 1 : -1;
        const rot = side * (28 + rnd(i, seed) * 22);
        return (
          <ellipse
            key={i}
            cx={px + side * 18}
            cy={py - 4}
            rx={17}
            ry={7}
            fill="#4E9A5C"
            opacity={0.55 + rnd(i, seed + 2) * 0.35}
            transform={`rotate(${rot} ${px + side * 18} ${py - 4})`}
          />
        );
      })}
      <circle cx={Number(pts[steps].split(',')[0])} cy={1010 - h} r={4} fill="#BDF0A8" opacity={0.8} />
    </g>
  );
};

const City: React.FC<S> = ({local}) => (
  <Svg>
    <Hud text="于是它无处不在" right="EVERYWHERE" />
    <rect width={1920} height={1080} fill="#0C111B" />
    <rect width={1920} height={700} fill="#0F1725" opacity={0.9} />
    <Skyline baseY={790} n={18} color="#1C2740" windows="#E8C08A" seed={6} minH={160} maxH={480} />
    <Skyline baseY={880} n={12} color="#243350" windows="#FADFAE" seed={12} minH={110} maxH={300} />
    {/* 贴着地平线的冷雾 */}
    <rect y={760} width={1920} height={260} fill="#101A2A" opacity={0.75} style={{filter: 'blur(52px)'}} />
    {/* 地面 */}
    <rect y={960} width={1920} height={120} fill="#080C12" />
    <path d="M0 962 Q480 946 960 962 T1920 954 L1920 1080 L0 1080 Z" fill="#080C12" />
    {/* 藤蔓 */}
    {[46, 196, 348, 498, 648, 792, 940, 1086, 1232, 1382, 1530, 1684, 1836].map((x, i) => (
      <Vine2 key={x} x={x} h={420 + rnd(i, 3) * 420} seed={i + 1} local={local} />
    ))}
    {/* 前景的草 */}
    {Array.from({length: 70}, (_, i) => {
      const x = rnd(i, 8) * 1920;
      const h = 16 + rnd(i, 9) * 54;
      return <line key={i} x1={x} y1={1000} x2={x + (rnd(i, 10) - 0.5) * 30} y2={1000 - h} stroke="#08120C" strokeWidth={2.6} />;
    })}
    <Motes local={local} n={40} color="rgba(200,230,255,0.35)" />
  </Svg>
);

/* ---------------- 10 深水 ---------------- */
const Water: React.FC<S> = ({local}) => {
  const surface = 520;
  const sink = interpolate(local, [0, 330], [0, 42], clamp);
  const headY = surface - 96 + sink;
  return (
    <Svg>
      <defs>
        <linearGradient id="airGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05070C" />
          <stop offset="100%" stopColor="#101B2E" />
        </linearGradient>
        <linearGradient id="deepGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070A10" />
          <stop offset="100%" stopColor="#020305" />
        </linearGradient>
      </defs>
      <Hud text="投入越多，越难抽身" right="SUNK  COST" />
      {/* 空气 */}
      <rect width={1920} height={surface} fill="url(#airGrad)" />
      {/* 远处的水面之上的冷光 */}
      <ellipse cx={960} cy={surface - 40} rx={760} ry={250} fill={P.cold} opacity={0.10} style={{filter: 'blur(80px)'}} />
      <ellipse cx={960} cy={surface - 6} rx={420} ry={90} fill={P.cold} opacity={0.10} style={{filter: 'blur(50px)'}} />
      {/* 人：只有头和一线肩露出水面 */}
      <g transform={`translate(960,${headY})`}>
        <circle cx={0} cy={0} r={48} fill="#04060A" />
        {/* 肩：从水面往下延伸，被水遮住 */}
        <path d="M-186 260 C-172 62 -120 26 0 26 C120 26 172 62 186 260 Z" fill="#04060A" />
      </g>
      {/* 水体 */}
      <rect y={surface} width={1920} height={1080 - surface} fill="url(#deepGrad)" opacity={0.94} />
      {/* 水下的倒影：竖直拉长的暗影 */}
      <g opacity={0.5} style={{filter: 'blur(8px)'}}>
        <ellipse cx={960} cy={surface + 110} rx={62} ry={110} fill="#020406" />
        <ellipse cx={960} cy={surface + 300} rx={96} ry={190} fill="#020406" opacity={0.6} />
      </g>
      {/* 水面高光带 */}
      <rect y={surface - 2} width={1920} height={4} fill="rgba(150,190,238,0.45)" />
      <rect y={surface + 2} width={1920} height={60} fill={P.cold} opacity={0.06} style={{filter: 'blur(20px)'}} />
      {/* 脖子周围的涟漪 */}
      {Array.from({length: 5}, (_, i) => (
        <ellipse
          key={i}
          cx={960}
          cy={surface + 16 + i * 24}
          rx={150 + i * 120 + Math.sin(local / 30 + i) * 12}
          ry={13 + i * 4}
          fill="none"
          stroke="rgba(150,190,238,0.16)"
          strokeWidth={2}
        />
      ))}
      {/* 水下的气泡 */}
      {Array.from({length: 16}, (_, i) => {
        const y = 600 + ((local * 0.7 + rnd(i, 2) * 460) % 460);
        return <circle key={i} cx={880 + rnd(i, 3) * 170} cy={y} r={1.8 + rnd(i, 4) * 2.6} stroke="rgba(150,190,238,0.22)" fill="none" strokeWidth={1.2} />;
      })}
      <Motes local={local} n={18} color="rgba(180,205,240,0.28)" />
    </Svg>
  );
};

/* ---------------- 11 筹码 ---------------- */
const Chips: React.FC<S> = ({local}) => {
  const push = spring({frame: local - 30, fps: 30, config: {damping: 24, mass: 0.8}});
  const chips = Array.from({length: 9}, (_, i) => i);
  return (
    <Svg>
      <Hud text="继续加注" right="ESCALATION" />
      {/* 桌面 */}
      <ellipse cx={960} cy={900} rx={1300} ry={430} fill="#101B15" opacity={0.9} />
      <ellipse cx={960} cy={720} rx={560} ry={200} fill={P.warm} opacity={0.05} style={{filter: 'blur(60px)'}} />
      <Beam x={760} y={0} w={400} spread={2.6} opacity={0.06} height={640} />
      {/* 远处的其他筹码 */}
      {[
        {x: 480, y: 604, n: 4, s: 0.55},
        {x: 1420, y: 616, n: 6, s: 0.6},
        {x: 1250, y: 560, n: 3, s: 0.42},
      ].map((st, k) => (
        <g key={k} transform={`translate(${st.x},${st.y}) scale(${st.s})`} opacity={0.5}>
          {Array.from({length: st.n}, (_, i) => (
            <g key={i} transform={`translate(0,${-i * 26})`}>
              <ellipse cx={0} cy={0} rx={104} ry={30} fill="#B99A72" />
              <ellipse cx={0} cy={-6} rx={104} ry={30} fill="#CDB08B" />
            </g>
          ))}
        </g>
      ))}
      {/* 筹码堆 */}
      <g transform="translate(960,720)">
        {chips.map((i) => (
          <g key={i} transform={`translate(0,${-i * 26})`}>
            <ellipse cx={0} cy={0} rx={104} ry={30} fill={i % 2 ? '#E8C9A0' : '#D8B380'} />
            <ellipse cx={0} cy={-6} rx={104} ry={30} fill={i % 2 ? '#F2DDBB' : '#E4C696'} />
            <ellipse cx={0} cy={-6} rx={64} ry={18} fill="#0E0E12" opacity={0.14} />
          </g>
        ))}
        {/* 新推进来的那枚：从右边滑上来 */}
        <g transform={`translate(${(1 - push) * 300},${-(chips.length - 1) * 26 * push})`}>
          <ellipse cx={0} cy={10} rx={106} ry={31} fill="#000" opacity={0.35} style={{filter: 'blur(10px)'}} />
          <ellipse cx={0} cy={0} rx={104} ry={30} fill="#8FD8A4" />
          <ellipse cx={0} cy={-7} rx={104} ry={30} fill="#B6EFC4" />
          <ellipse cx={0} cy={-7} rx={64} ry={18} fill="#3E8E58" opacity={0.5} />
        </g>
      </g>
      <Bloom blur={60} opacity={0.22}>
        <ellipse cx={960} cy={640} rx={260} ry={90} fill={P.mint} />
      </Bloom>
      <Motes local={local} n={26} color="rgba(255,238,210,0.4)" />
    </Svg>
  );
};

/* ---------------- 12 强光门洞 ---------------- */
const Gate: React.FC<S> = ({local}) => {
  const fade = interpolate(local, [0, 260], [0, 1], clamp);
  return (
    <Svg>
      <Hud text="先让你付出，再让你舍不得走" right="TRAP" />
      <Room cx={960} cy={430} bw={520} bh={560} wall="#141419" floor="#141419" ceil="#0E0E12" side="#101014" guides guideColor="rgba(244,240,232,0.04)" />
      {/* 门洞：向内收的两层框，制造纵深 */}
      <rect x={700} y={150} width={520} height={560} fill="#EFE2C8" />
      <rect x={790} y={250} width={340} height={380} fill="#F8EFD9" />
      <rect x={862} y={330} width={196} height={220} fill="#FFFBF0" />
      <g stroke="rgba(255,255,255,0.55)" strokeWidth={2}>
        <line x1={700} y1={150} x2={790} y2={250} />
        <line x1={1220} y1={150} x2={1130} y2={250} />
        <line x1={700} y1={710} x2={790} y2={630} />
        <line x1={1220} y1={710} x2={1130} y2={630} />
      </g>
      <rect x={945} y={390} width={30} height={160} fill="#FFFDF8" />
      <Bloom blur={110} opacity={0.55}>
        <rect x={700} y={150} width={520} height={560} fill="#FFF6E4" />
      </Bloom>
      <polygon points={`700,710 1220,710 1620,1080 300,1080`} fill="url(#warmFloor)" opacity={0.26} />
      {/* 走进去的人：越靠里越被光吃掉 */}
      {[
        {x: 806, y: 926, s: 1.16, a: 1},
        {x: 900, y: 858, s: 0.86, a: 0.5},
        {x: 952, y: 800, s: 0.6, a: 0.22},
        {x: 976, y: 756, s: 0.42, a: 0.08},
      ].map((p, i) => (
        <Person key={i} x={p.x} y={p.y} s={p.s} color={`rgba(9,9,13,${p.a})`} rim="rgba(255,246,228,0.35)" />
      ))}
      <rect width={1920} height={1080} fill="#FFF6E4" opacity={fade * 0.06} />
      <Motes local={local} n={34} color="rgba(255,246,228,0.55)" />
    </Svg>
  );
};

/* ---------------- 13 笔记本：写下退出线 ---------------- */
const Notebook: React.FC<S> = ({local}) => {
  const draw = interpolate(local, [56, 150], [0, 1], clamp);
  return (
    <Svg>
      <Hud text="三个动作" right="EXIT  LINE" />
      <Beam x={780} y={0} w={360} spread={2.8} opacity={0.07} height={600} />
      {/* 桌面 */}
      <rect y={640} width={1920} height={440} fill="#141017" />
      {/* 左右页 */}
      <g transform="translate(0,-56)">
        <rect x={286} y={272} width={1360} height={560} rx={14} fill="#05050A" opacity={0.85} style={{filter: 'blur(26px)'}} />
        <rect x={300} y={250} width={660} height={560} rx={6} fill="#332F35" />
        <rect x={960} y={250} width={660} height={560} rx={6} fill="#38333A" />
        {/* 纸张上沿的高光与装订边 */}
        <line x1={300} y1={252} x2={1620} y2={252} stroke="rgba(255,246,228,0.10)" strokeWidth={2} />
        <line x1={356} y1={250} x2={356} y2={810} stroke="rgba(226,110,110,0.18)" strokeWidth={2} />
        <line x1={1016} y1={250} x2={1016} y2={810} stroke="rgba(226,110,110,0.12)" strokeWidth={2} />
        <rect x={952} y={250} width={16} height={560} fill="#17151A" />
        {/* 横线 */}
        {Array.from({length: 8}, (_, i) => (
          <g key={i}>
            <line x1={356} y1={350 + i * 54} x2={906} y2={350 + i * 54} stroke="rgba(244,240,232,0.09)" strokeWidth={1.4} />
            <line x1={1016} y1={350 + i * 54} x2={1566} y2={350 + i * 54} stroke="rgba(244,240,232,0.09)" strokeWidth={1.4} />
          </g>
        ))}
        {/* 三个短标记 */}
        {['拆掉付出', '事前定价', '退出线'].map((t, i) => (
          <g key={t}>
            <circle cx={372} cy={344 + i * 90} r={5} fill={i === 2 ? P.mint : P.warm} opacity={0.85} />
            <text x={396} y={352 + i * 90} fill={i === 2 ? P.mint : P.ink} opacity={0.85} style={{fontFamily: '"Noto Sans SC", sans-serif', fontSize: 26, fontWeight: 700}}>
              {t}
            </text>
          </g>
        ))}
        {/* 退出线：正在被画出来 */}
        <line
          x1={1016}
          y1={520}
          x2={1016 + 550 * draw}
          y2={520}
          stroke={P.mint}
          strokeWidth={3}
          opacity={0.9}
          strokeDasharray="8 8"
        />
        <Bloom blur={26} opacity={0.5}>
          <line x1={1016} y1={520} x2={1016 + 550 * draw} y2={520} stroke={P.mint} strokeWidth={3} />
        </Bloom>
      </g>
      {/* 台灯的光池：压在左页上 */}
      <ellipse cx={640} cy={470} rx={520} ry={330} fill={P.warm} opacity={0.07} style={{filter: 'blur(70px)'}} />
      <ellipse cx={640} cy={560} rx={300} ry={150} fill={P.warm} opacity={0.05} style={{filter: 'blur(46px)'}} />
      <Motes local={local} n={26} color="rgba(255,238,210,0.4)" />
    </Svg>
  );
};

/* ---------------- 14 收尾：敞开的门 ---------------- */
const Opening: React.FC<S> = ({local}) => {
  const grow = interpolate(local, [0, 200], [0.86, 1], clamp);
  return (
    <Svg>
      <Hud text="让努力改变事情" right="NOT  THE  JUDGEMENT" />
      <Room cx={960} cy={420} bw={620} bh={600} wall="#131319" floor="#131319" ceil="#0D0D11" side="#0F0F13" guides guideColor="rgba(244,240,232,0.04)" />
      <g transform={`translate(960,560) scale(${grow}) translate(-960,-560)`}>
        <rect x={810} y={200} width={300} height={560} fill="#FFF8EA" opacity={0.92} />
        <rect x={810} y={200} width={300} height={560} fill="url(#doorCore)" />
        <Bloom blur={120} opacity={0.55}>
          <rect x={810} y={200} width={300} height={560} fill="#FFF6E4" />
        </Bloom>
        <rect x={792} y={186} width={18} height={588} fill="#0A0A0D" />
        <rect x={1110} y={186} width={18} height={588} fill="#0A0A0D" />
        <rect x={792} y={186} width={336} height={16} fill="#0A0A0D" />
        <polygon points={`810,760 1110,760 1420,1080 500,1080`} fill="url(#warmFloor)" opacity={0.26} />
        {/* 门槛线 */}
        <line x1={810} y1={760} x2={1110} y2={760} stroke="rgba(255,248,234,0.6)" strokeWidth={2} />
      </g>
      {/* 门里站着的人 */}
      <Person x={958} y={772} s={0.78} color="#0A0A0E" rim="rgba(255,250,236,0.22)" />
      <Motes local={local} n={50} color="rgba(255,240,214,0.5)" area={700} />
    </Svg>
  );
};

export const SCENES: Record<string, React.FC<S>> = {
  shop: Shop,
  desk: Desk,
  void: VoidBg,
  corridor: Corridor,
  tape: Tape,
  pillars: Pillars,
  profile: Profile,
  scale: Scale,
  city: City,
  water: Water,
  chips: Chips,
  gate: Gate,
  notebook: Notebook,
  opening: Opening,
};
