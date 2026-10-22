import React from 'react';
import {P} from './palette';

export const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** 辉光：同形状模糊复制，制造 bloom */
export const Bloom: React.FC<{blur?: number; opacity?: number; children: React.ReactNode}> = ({
  blur = 26,
  opacity = 0.55,
  children,
}) => (
  <g style={{filter: `blur(${blur}px)`}} opacity={opacity}>
    {children}
  </g>
);

/** 一点透视的房间：后墙 + 四个面 */
export const Room: React.FC<{
  cx?: number;
  cy?: number;
  bw?: number;
  bh?: number;
  wall?: string;
  floor?: string;
  ceil?: string;
  side?: string;
  guides?: boolean;
  guideColor?: string;
  floorFill?: string;
}> = ({
  cx = 960,
  cy = 470,
  bw = 1480,
  bh = 610,
  wall = P.wall,
  floor = P.floor,
  ceil = P.ceil,
  side = P.wallSide,
  guides = false,
  guideColor = 'rgba(255,255,255,0.05)',
  floorFill,
}) => {
  const L = cx - bw / 2;
  const R = cx + bw / 2;
  const T = cy - bh / 2;
  const B = cy + bh / 2;
  return (
    <g>
      <polygon points={`0,0 ${L},${T} ${L},${B} 0,1080`} fill={side} />
      <polygon points={`1920,0 ${R},${T} ${R},${B} 1920,1080`} fill={side} />
      <polygon points={`0,0 1920,0 ${R},${T} ${L},${T}`} fill={ceil} />
      <polygon points={`0,1080 1920,1080 ${R},${B} ${L},${B}`} fill={floor} />
      {floorFill ? <polygon points={`0,1080 1920,1080 ${R},${B} ${L},${B}`} fill={floorFill} /> : null}
      <rect x={L} y={T} width={bw} height={bh} fill={wall} />
      {guides ? (
        <g stroke={guideColor} strokeWidth={2} fill="none">
          <polygon points={`${L},${T} ${R},${T} ${R},${B} ${L},${B}`} />
          <line x1={0} y1={0} x2={L} y2={T} />
          <line x1={1920} y1={0} x2={R} y2={T} />
          <line x1={0} y1={1080} x2={L} y2={B} />
          <line x1={1920} y1={1080} x2={R} y2={B} />
        </g>
      ) : null}
    </g>
  );
};

/** 发光的窗 / 面板：多格 + 辉光 + 内部微粒 */
export const Win: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  cols?: number;
  rows?: number;
  color?: string;
  opacity?: number;
  glow?: number;
  seed?: number;
  frameColor?: string;
  dirt?: boolean;
}> = ({
  x,
  y,
  w,
  h,
  cols = 2,
  rows = 2,
  color = P.warm,
  opacity = 1,
  glow = 34,
  seed = 1,
  frameColor = '#0E0E12',
  dirt = true,
}) => {
  const panes: React.ReactNode[] = [];
  const gap = 10;
  const pw = (w - gap * (cols - 1)) / cols;
  const ph = (h - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      panes.push(
        <rect
          key={`${r}-${c}`}
          x={x + c * (pw + gap)}
          y={y + r * (ph + gap)}
          width={pw}
          height={ph}
          fill={color}
          opacity={opacity}
        />,
      );
    }
  }
  return (
    <g>
      <Bloom blur={glow} opacity={0.5}>
        <rect x={x} y={y} width={w} height={h} fill={color} opacity={0.9} />
      </Bloom>
      {panes}
      {dirt ? (
        <g opacity={0.5}>
          {Array.from({length: 26}, (_, i) => (
            <circle
              key={i}
              cx={x + rnd(i, seed) * w}
              cy={y + rnd(i, seed + 3) * h}
              r={0.9 + rnd(i, seed + 7) * 1.6}
              fill="#7A6242"
              opacity={0.35 + rnd(i, seed + 9) * 0.35}
            />
          ))}
        </g>
      ) : null}
      <rect
        x={x - 3}
        y={y - 3}
        width={w + 6}
        height={h + 6}
        fill="none"
        stroke={frameColor}
        strokeWidth={6}
        opacity={0.9}
      />
    </g>
  );
};

/** 光束：从某点向下的梯形 */
export const Beam: React.FC<{
  x: number;
  y: number;
  w: number;
  spread?: number;
  color?: string;
  opacity?: number;
  height?: number;
  blur?: number;
}> = ({x, y, w, spread = 2.2, color = P.warm, opacity = 0.1, height = 1080, blur = 46}) => (
  <g opacity={opacity} style={{filter: `blur(${blur}px)`}}>
    <polygon points={`${x},${y} ${x + w},${y} ${x + w / 2 + (w * spread) / 2},${height} ${x + w / 2 - (w * spread) / 2},${height}`} fill={color} />
  </g>
);

/** 人形剪影：脚在 (x,y) */
export const Person: React.FC<{
  x: number;
  y: number;
  s?: number;
  color?: string;
  opacity?: number;
  rim?: string;
  lean?: number;
}> = ({x, y, s = 1, color = P.dark, opacity = 1, rim, lean = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <g transform={`rotate(${lean})`}>
      {/* 颈 */}
      <rect x={-11} y={-170} width={22} height={26} fill={color} />
      {/* 头 */}
      <ellipse cx={0} cy={-186} rx={26} ry={30} fill={color} />
      {/* 肩与躯干 */}
      <path d="M-54 0 C-54 -70 -46 -118 -30 -140 C-16 -158 16 -158 30 -140 C46 -118 54 -70 54 0 Z" fill={color} />
      {rim ? (
        <path
          d="M-54 0 C-54 -70 -46 -118 -30 -140 C-16 -158 16 -158 30 -140 C46 -118 54 -70 54 0"
          fill="none"
          stroke={rim}
          strokeWidth={2.4}
          opacity={0.65}
        />
      ) : null}
    </g>
  </g>
);

/** 尘埃：缓慢上浮的细点 */
export const Motes: React.FC<{n?: number; local: number; color?: string; seed?: number; area?: number}> = ({
  n = 46,
  local,
  color = 'rgba(255,244,226,0.55)',
  seed = 2,
  area = 420,
}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const baseX = rnd(i, seed) * 1920;
      const speed = 0.22 + rnd(i, seed + 1) * 0.55;
      const y = 1080 - ((local * speed + rnd(i, seed + 2) * 1080) % 1080);
      const x = baseX + Math.sin((local / 40 + rnd(i, seed + 5) * 6.28)) * area / 8;
      const r = 1 + rnd(i, seed + 3) * 2.2;
      const op = 0.2 + rnd(i, seed + 4) * 0.6;
      return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={op * 0.6} />;
    })}
  </g>
);

/** 城市天际线 */
export const Skyline: React.FC<{
  baseY?: number;
  color?: string;
  windows?: string;
  seed?: number;
  n?: number;
  minH?: number;
  maxH?: number;
}> = ({baseY = 700, color = '#1C2231', windows = '#E8C98E', seed = 4, n = 15, minH = 120, maxH = 420}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const w = 70 + rnd(i, seed) * 90;
      const h = minH + rnd(i, seed + 1) * (maxH - minH);
      const x = i * (1920 / n) - 20 + rnd(i, seed + 2) * 30;
      const y = baseY - h;
      const cols = Math.max(1, Math.floor((w - 16) / 22));
      const rows = Math.max(1, Math.floor((h - 24) / 30));
      const cells: React.ReactNode[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lit = rnd(i * 91 + r * 17 + c * 3, seed + 5);
          if (lit < 0.42) continue;
          cells.push(
            <rect
              key={`${r}-${c}`}
              x={x + 10 + c * 22}
              y={y + 16 + r * 30}
              width={8}
              height={11}
              fill={windows}
              opacity={0.25 + lit * 0.7}
            />,
          );
        }
      }
      return (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill={color} />
          {cells}
        </g>
      );
    })}
  </g>
);

/** 藤蔓：向上生长的曲线 + 节点 */
export const Vine: React.FC<{
  x: number;
  y: number;
  h?: number;
  amp?: number;
  color?: string;
  tip?: string;
  seed?: number;
  local?: number;
  sway?: number;
}> = ({x, y, h = 420, amp = 60, color = '#6FBF73', tip = '#B9F5A8', seed = 1, local = 0, sway = 6}) => {
  const pts: string[] = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const dx = Math.sin(t * 3.2 + seed) * amp * (0.35 + t * 0.8) + Math.sin(local / 34 + seed + t * 2) * sway * t;
    pts.push(`${x + dx},${y - h * t}`);
  }
  const d = `M${pts.join(' L')}`;
  return (
    <g>
      <path d={d} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={d} stroke={color} strokeWidth={11} fill="none" opacity={0.18} strokeLinecap="round" />
      {Array.from({length: 14}, (_, i) => {
        const t = 0.08 + (i / 13) * 0.92;
        const idx = Math.min(steps, Math.round(t * steps));
        const [px, py] = pts[idx].split(',').map(Number);
        return <circle key={i} cx={px + (rnd(i, seed) - 0.5) * 14} cy={py - 6} r={2.6} fill={tip} opacity={0.5 + rnd(i, seed + 2) * 0.5} />;
      })}
    </g>
  );
};

/** 左上角小标签 */
export const Hud: React.FC<{text: string; right?: string; opacity?: number}> = ({text, right, opacity = 0.5}) => (
  <>
    <text x={92} y={86} fill={P.ink} opacity={opacity} style={{fontFamily: '"Consolas", monospace', fontSize: 20, letterSpacing: 4}}>
      {text}
    </text>
    {right ? (
      <text x={1828} y={86} textAnchor="end" fill={P.ink} opacity={opacity * 0.8} style={{fontFamily: '"Consolas", monospace', fontSize: 20, letterSpacing: 4}}>
        {right}
      </text>
    ) : null}
  </>
);

/** 地平线上的刻度线 */
export const Ticks: React.FC<{y: number; color?: string; n?: number}> = ({y, color = 'rgba(244,240,232,0.16)', n = 9}) => (
  <g stroke={color} strokeWidth={1.5}>
    <line x1={120} y1={y} x2={1800} y2={y} />
    {Array.from({length: n}, (_, i) => {
      const x = 120 + (1680 / (n - 1)) * i;
      return <line key={i} x1={x} y1={y} x2={x} y2={y + (i % 4 === 0 ? 18 : 9)} />;
    })}
  </g>
);
