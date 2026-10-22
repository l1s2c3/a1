import React from 'react';
import {interpolate} from 'remotion';
import {F, P} from './palette';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

type Seg = {ch: string; hl: boolean};

const parse = (text: string): Seg[] =>
  text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .flatMap((part) => {
      const hl = part.startsWith('**') && part.endsWith('**');
      const body = hl ? part.slice(2, -2) : part;
      return [...body].map((ch) => ({ch, hl}));
    });

/** 逐字上浮 + 由虚到实的入场 */
const Line: React.FC<{text: string; local: number; size: number; delay?: number; step?: number}> = ({
  text,
  local,
  size,
  delay = 0,
  step = 0.8,
}) => {
  const segs = parse(text);
  return (
    <>
      {segs.map((s, i) => {
        const p = interpolate(local, [delay + i * step, delay + i * step + 13], [0, 1], {
          ...clamp,
          easing: (x) => 1 - Math.pow(1 - x, 3),
        });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: p,
              color: s.hl ? P.mint : P.ink,
              transform: `translateY(${(1 - p) * size * 0.26}px)`,
              filter: `blur(${(1 - p) * size * 0.06}px)`,
              textShadow: s.hl
                ? `0 0 14px rgba(143,227,168,0.55), 0 0 46px rgba(143,227,168,0.28), 0 0 90px rgba(143,227,168,0.12)`
                : `0 0 16px rgba(255,246,230,0.30), 0 0 52px rgba(255,246,230,0.14), 0 10px 40px rgba(0,0,0,0.75)`,
            }}
          >
            {s.ch === ' ' ? '\u00A0' : s.ch}
          </span>
        );
      })}
    </>
  );
};

/** 常规叙述字幕：底部居中，一行 */
export const Narration: React.FC<{text: string; local: number; opacity: number}> = ({text, local, opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 124,
      textAlign: 'center',
      opacity,
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: 90,
      lineHeight: 1.34,
      letterSpacing: '0.015em',
    }}
  >
    <Line text={text} local={local} size={90} />
  </div>
);

/** 论断：更大，略高一点 */
export const Statement: React.FC<{text: string; local: number; opacity: number}> = ({text, local, opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 300,
      textAlign: 'center',
      opacity,
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: 122,
      lineHeight: 1.3,
      letterSpacing: '0.02em',
    }}
  >
    <Line text={text} local={local} size={122} step={1.1} />
  </div>
);

/** 片名 */
export const Hero: React.FC<{
  title: string;
  en: string;
  kicker?: string;
  local: number;
  opacity: number;
}> = ({title, en, kicker, local, opacity}) => {
  const kick = interpolate(local, [4, 24], [0, 1], clamp);
  const rule = interpolate(local, [30, 58], [0, 1], {
    ...clamp,
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const sub = interpolate(local, [40, 62], [0, 1], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 20,
          letterSpacing: '0.5em',
          color: 'rgba(244,240,232,0.5)',
          opacity: kick,
          marginBottom: 44,
          transform: `translateY(${(1 - kick) * 10}px)`,
        }}
      >
        {kicker ?? 'SOCIAL  PSYCHOLOGY'}
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 700,
          fontSize: 168,
          letterSpacing: '0.06em',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        <Line text={title} local={local} size={168} delay={6} step={2.8} />
      </div>
      <div
        style={{
          width: 560 * rule,
          height: 1.5,
          marginTop: 42,
          background: 'linear-gradient(90deg, rgba(232,203,160,0), rgba(232,203,160,0.85), rgba(232,203,160,0))',
        }}
      />
      <div
        style={{
          marginTop: 34,
          fontFamily: F.mono,
          fontSize: 26,
          letterSpacing: '0.42em',
          color: 'rgba(232,203,160,0.85)',
          opacity: sub,
        }}
      >
        {en}
      </div>
    </div>
  );
};
