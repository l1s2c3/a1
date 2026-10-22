import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {C, F} from '../theme';

export const clampBoth = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

/** 0→1 的缓出进度 */
export const easeOut = (frame: number, delay = 0, dur = 20) =>
  interpolate(frame, [delay, delay + dur], [0, 1], {
    ...clampBoth,
    easing: Easing.out(Easing.cubic),
  });

export const easeInOut = (frame: number, delay = 0, dur = 20) =>
  interpolate(frame, [delay, delay + dur], [0, 1], {
    ...clampBoth,
    easing: Easing.inOut(Easing.cubic),
  });

/** 弹性入场（不抖动） */
export const smoothSpring = (frame: number, delay = 0, stiffness = 90) => {
  const f = Math.max(0, frame - delay);
  return interpolate(f, [0, 34], [0, 1], {
    ...clampBoth,
    easing: Easing.out(Easing.back(1.04)),
  });
};

export const Reveal: React.FC<{
  delay?: number;
  dur?: number;
  y?: number;
  blur?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({delay = 0, dur = 22, y = 28, blur = true, style, children}) => {
  const frame = useCurrentFrame();
  const p = easeOut(frame, delay, dur);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * y}px)`,
        filter: blur ? `blur(${(1 - p) * 4}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SceneShell: React.FC<{
  duration: number;
  padding?: number | string;
  children: React.ReactNode;
}> = ({duration, padding = '92px 100px 196px', children}) => {
  const frame = useCurrentFrame();
  const fadeIn = easeOut(frame, 0, 9);
  const fadeOut = interpolate(frame, [duration - 10, duration - 1], [1, 0], clampBoth);
  const lift = interpolate(frame, [0, 14], [14, 0], {
    ...clampBoth,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translateY(${lift}px)`,
        padding,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** 小标签：破折号 + 字距很宽的说明 */
export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({
  children,
  color = C.amber,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
    <div style={{width: 46, height: 1, background: color, opacity: 0.8}} />
    <div
      style={{
        fontFamily: F.sans,
        fontSize: 21,
        letterSpacing: '0.34em',
        color,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  </div>
);

export const SceneTitle: React.FC<{children: React.ReactNode; size?: number}> = ({
  children,
  size = 62,
}) => (
  <div
    style={{
      fontFamily: F.serif,
      fontSize: size,
      fontWeight: 700,
      color: C.ink,
      letterSpacing: '0.015em',
      lineHeight: 1.28,
    }}
  >
    {children}
  </div>
);

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const glowX = 66 + Math.sin(t * 0.22) * 5;
  const glowY = 20 + Math.cos(t * 0.17) * 4;

  const mask = 'radial-gradient(1250px 820px at 52% 46%, #000 8%, rgba(0,0,0,0.25) 62%, transparent 88%)';

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(1150px 780px at ${glowX}% ${glowY}%, rgba(233,166,60,0.115), rgba(8,10,14,0) 62%),` +
            `radial-gradient(900px 720px at 8% 96%, rgba(79,179,166,0.075), rgba(8,10,14,0) 60%),` +
            'linear-gradient(158deg, #0D131C 0%, #080A0E 54%, #0A0E14 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(244,238,227,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,238,227,0.05) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage: mask,
          WebkitMaskImage: mask,
          opacity: 0.9,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('grain.png')})`,
          backgroundRepeat: 'repeat',
          opacity: 0.075,
          mixBlendMode: 'overlay',
        }}
      />
      <AbsoluteFill
        style={{boxShadow: 'inset 0 0 300px 80px rgba(0,0,0,0.7)'}}
      />
    </AbsoluteFill>
  );
};

const renderCueText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} style={{color: C.amber, fontWeight: 700}}>
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export const Subtitles: React.FC<{
  cues: {from: number; to: number; text: string}[];
  fps: number;
  totalFrames: number;
}> = ({cues, fps, totalFrames}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.from && t < c.to);
  const progress = Math.min(1, frame / (totalFrames - 1));

  let opacity = 1;
  if (cue) {
    const f0 = cue.from * fps;
    const f1 = cue.to * fps;
    const pIn = interpolate(frame, [f0, f0 + 6], [0, 1], clampBoth);
    const pOut = interpolate(frame, [f1 - 6, f1], [1, 0], clampBoth);
    opacity = Math.min(pIn, pOut);
  }

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to top, rgba(4,6,9,0.94) 0%, rgba(4,6,9,0.72) 12%, rgba(4,6,9,0) 30%)',
        }}
      />
      {cue ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 62,
            display: 'flex',
            justifyContent: 'center',
            opacity,
          }}
        >
          <div
            style={{
              maxWidth: 1520,
              padding: '0 40px',
              textAlign: 'center',
              fontFamily: F.sans,
              fontSize: 45,
              fontWeight: 500,
              lineHeight: 1.5,
              letterSpacing: '0.012em',
              color: C.ink,
              textShadow: '0 3px 26px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9)',
            }}
          >
            {renderCueText(cue.text)}
          </div>
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 3,
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, rgba(233,166,60,0.35), ${C.amber})`,
          opacity: 0.85,
        }}
      />
    </AbsoluteFill>
  );
};
