import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';

const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const COUNT = 44;

const dust = Array.from({length: COUNT}, (_, i) => ({
  x: rnd(i, 1) * 1920,
  speed: 3 + rnd(i, 2) * 9,
  r: 0.8 + rnd(i, 3) * 1.7,
  alpha: 0.06 + rnd(i, 4) * 0.16,
  phase: rnd(i, 5),
}));

export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* 全局浮尘：让镜头之间保持同一口气 */}
      {dust.map((p, i) => {
        const span = 1180;
        const y = 1120 - ((t * p.speed + p.phase * span) % span);
        const x = p.x + Math.sin(t * 0.28 + p.phase * 6.28) * 18;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: '50%',
              background: `rgba(255,246,228,${p.alpha})`,
            }}
          />
        );
      })}

      {/* 轻暗角，保留平涂的干净感 */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(125% 110% at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.28) 82%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* 极轻的胶片噪点 */}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('grain.png')})`,
          backgroundRepeat: 'repeat',
          backgroundPosition: `${(frame * 5) % 200}px ${(frame * 11) % 200}px`,
          opacity: 0.05,
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
};

export const Progress: React.FC<{total: number}> = ({total}) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, frame / (total - 1));
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: 2,
        width: `${p * 100}%`,
        background: 'linear-gradient(90deg, rgba(232,203,160,0.18), rgba(232,203,160,0.7))',
        opacity: 0.55,
      }}
    />
  );
};
