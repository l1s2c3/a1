import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CUES, FPS, type Cue} from '../film';
import {C, F} from '../theme';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

type Seg = {ch: string; hl: boolean};

const parse = (text: string): Seg[] => {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .flatMap((part) => {
      const hl = part.startsWith('**') && part.endsWith('**');
      const body = hl ? part.slice(2, -2) : part;
      return [...body].map((ch) => ({ch, hl}));
    });
};

const Chars: React.FC<{
  text: string;
  local: number;
  size: number;
  stagger?: number;
  dur?: number;
  delay?: number;
  glow?: boolean;
}> = ({text, local, size, stagger = 1.35, dur = 14, delay = 2, glow}) => {
  const segs = parse(text);
  return (
    <>
      {segs.map((s, i) => {
        const p = interpolate(local, [delay + i * stagger, delay + i * stagger + dur], [0, 1], {
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
              color: s.hl ? C.amber : C.ink,
              transform: `translateY(${(1 - p) * size * 0.34}px)`,
              textShadow: s.hl
                ? `0 0 ${size * 0.42}px rgba(233,166,60,0.35), 0 4px 24px rgba(0,0,0,0.85)`
                : glow
                ? `0 0 ${size * 0.5}px rgba(255,240,214,0.18), 0 4px 26px rgba(0,0,0,0.8)`
                : '0 4px 24px rgba(0,0,0,0.85)',
            }}
          >
            {s.ch === ' ' ? '\u00A0' : s.ch}
          </span>
        );
      })}
    </>
  );
};

const Sub: React.FC<{cue: Cue; local: number; opacity: number}> = ({cue, local, opacity}) => (
  <div
    style={{
      position: 'absolute',
      left: 118,
      bottom: 108,
      maxWidth: 1290,
      opacity,
      fontFamily: F.serif,
      fontSize: 62,
      fontWeight: 700,
      lineHeight: 1.54,
      letterSpacing: '0.02em',
      textAlign: 'left',
    }}
  >
    <Chars text={cue.text} local={local} size={62} />
  </div>
);

const Big: React.FC<{cue: Cue; local: number; opacity: number}> = ({cue, local, opacity}) => {
  const left = cue.align === 'left';
  return (
    <div
      style={{
        position: 'absolute',
        ...(left
          ? {left: 130, top: '40%', maxWidth: 1100, textAlign: 'left' as const}
          : {left: 0, right: 0, top: '42%', textAlign: 'center' as const}),
        opacity,
        fontFamily: F.serif,
        fontSize: 104,
        fontWeight: 700,
        lineHeight: 1.42,
        letterSpacing: '0.03em',
      }}
    >
      <Chars text={cue.text} local={local} size={104} stagger={2.2} dur={16} glow />
    </div>
  );
};

const Hero: React.FC<{cue: Cue; local: number; opacity: number}> = ({cue, local, opacity}) => {
  const rule = interpolate(local, [34, 62], [0, 1], {
    ...clamp,
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const subOp = interpolate(local, [46, 66], [0, 1], clamp);
  const rise = interpolate(local, [0, 40], [24, 0], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div
        style={{
          fontFamily: F.sans,
          fontSize: 18,
          letterSpacing: '0.5em',
          color: 'rgba(244,238,227,0.58)',
          opacity: subOp,
          marginBottom: 40,
        }}
      >
        1959 · 社会心理学
      </div>

      <div
        style={{
          fontFamily: F.serif,
          fontSize: 168,
          fontWeight: 700,
          letterSpacing: '0.08em',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        <Chars text={cue.text} local={local} size={168} stagger={3.4} dur={20} glow />
      </div>

      <div
        style={{
          width: 520 * rule,
          height: 1,
          marginTop: 40,
          background: `linear-gradient(90deg, rgba(233,166,60,0.1), ${C.amber}, rgba(233,166,60,0.1))`,
        }}
      />

      <div
        style={{
          marginTop: 30,
          fontFamily: F.sans,
          fontSize: 24,
          letterSpacing: '0.46em',
          color: C.amber,
          opacity: subOp,
        }}
      >
        {cue.sub}
      </div>
    </div>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cue = CUES.find((c) => t >= c.from && t < c.to);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* 字幕压底 */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to top, rgba(2,3,5,0.86) 0%, rgba(2,3,5,0.45) 14%, rgba(2,3,5,0) 34%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(1100px 620px at 0% 100%, rgba(2,3,5,0.55), rgba(2,3,5,0) 70%)',
        }}
      />

      {cue
        ? (() => {
            const f0 = Math.round(cue.from * FPS);
            const f1 = Math.round(cue.to * FPS);
            const local = frame - f0;
            const opacity = Math.min(
              interpolate(frame, [f0, f0 + 4], [0, 1], clamp),
              interpolate(frame, [f1 - 5, f1], [1, 0], clamp),
            );
            const kind = cue.kind ?? 'sub';
            if (kind === 'hero')
              return <Hero key={cue.from} cue={cue} local={local} opacity={opacity} />;
            if (kind === 'big')
              return <Big key={cue.from} cue={cue} local={local} opacity={opacity} />;
            return <Sub key={cue.from} cue={cue} local={local} opacity={opacity} />;
          })()
        : null}
    </AbsoluteFill>
  );
};
