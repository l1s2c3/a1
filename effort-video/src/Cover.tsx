import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';

const FONT = '"Noto Sans SC", sans-serif';
const GOLD = '#FFC85C';

/** 封面共用：标题 + 英文 + 反问钩子，视频同款暖金强调 */
const CoverArt: React.FC<{variant: 'h' | 'v'; bg: string}> = ({variant, bg}) => {
  const h = variant === 'h';
  const W = h ? 1920 : 1080;
  const H = h ? 1080 : 1920;
  const title = h ? 168 : 128;
  const sub = h ? 30 : 24;
  const hook = h ? 48 : 40;
  return (
    <AbsoluteFill style={{backgroundColor: '#050507'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="tshadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx={0} dy={6} stdDeviation={18} floodColor="#000" floodOpacity={0.85} />
          </filter>
          <filter id="tshadow2" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx={0} dy={3} stdDeviation={8} floodColor="#000" floodOpacity={0.7} />
          </filter>
          <linearGradient id="ctop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={h ? 0.42 : 0.62} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cbot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={h ? 0.55 : 0.62} />
          </linearGradient>
        </defs>
        {/* 底图：成片的静帧，铺满裁切 */}
        <image
          href={staticFile(bg)}
          width={W}
          height={H}
          preserveAspectRatio="xMidYMid slice"
          opacity={0.94}
        />
        <rect width={W} height={H} fill="url(#ctop)" />
        <rect width={W} height={H} fill="url(#cbot)" />

        {/* 标题 */}
        <text
          x={W / 2}
          y={h ? 448 : 430}
          textAnchor="middle"
          filter="url(#tshadow)"
          style={{fontFamily: FONT, fontSize: title, fontWeight: 800, letterSpacing: h ? 8 : 6}}
        >
          <tspan fill="#FFF6E6">努力</tspan>
          <tspan fill={GOLD}>辩护</tspan>
          <tspan fill="#FFF6E6">效应</tspan>
        </text>

        {/* 英文副题 */}
        <text
          x={W / 2}
          y={h ? 546 : 508}
          textAnchor="middle"
          fill="rgba(255,246,230,0.55)"
          letterSpacing={h ? 14 : 9}
          filter="url(#tshadow2)"
          style={{fontFamily: '"Consolas", monospace', fontSize: sub}}
        >
          EFFORT JUSTIFICATION
        </text>

        {/* 反问钩子 */}
        {h ? (
          <text
            x={W / 2}
            y={668}
            textAnchor="middle"
            fill="rgba(255,246,230,0.82)"
            filter="url(#tshadow2)"
            style={{fontFamily: FONT, fontSize: hook, fontWeight: 600, letterSpacing: 3}}
          >
            你舍不得的，是它，还是自己吃过的苦？
          </text>
        ) : (
          <>
            <text
              x={W / 2}
              y={640}
              textAnchor="middle"
              fill="rgba(255,246,230,0.82)"
              filter="url(#tshadow2)"
              style={{fontFamily: FONT, fontSize: hook, fontWeight: 600, letterSpacing: 2}}
            >
              你舍不得的，是它，
            </text>
            <text
              x={W / 2}
              y={700}
              textAnchor="middle"
              fill="rgba(255,246,230,0.82)"
              filter="url(#tshadow2)"
              style={{fontFamily: FONT, fontSize: hook, fontWeight: 600, letterSpacing: 2}}
            >
              还是自己吃过的苦？
            </text>
          </>
        )}

        {/* 角标 */}
        <text
          x={h ? 90 : 70}
          y={h ? 1012 : 1840}
          fill="rgba(255,246,230,0.42)"
          style={{fontFamily: FONT, fontSize: h ? 28 : 24, letterSpacing: 2}}
        >
          {h ? '1959 · 阿伦森和米尔斯的实验' : '1959 · 阿伦森和米尔斯'}
        </text>
        <text
          x={h ? W - 90 : W - 70}
          y={h ? 1012 : 1840}
          textAnchor="end"
          fill="rgba(255,246,230,0.42)"
          style={{fontFamily: FONT, fontSize: h ? 28 : 24, letterSpacing: 2}}
        >
          无配音 · 82 秒
        </text>
      </svg>
    </AbsoluteFill>
  );
};

export const CoverH: React.FC = () => <CoverArt variant="h" bg="cover_balance.png" />;
export const CoverV: React.FC = () => <CoverArt variant="v" bg="cover_glow.png" />;
