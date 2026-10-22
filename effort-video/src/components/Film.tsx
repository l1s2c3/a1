import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {SHOTS, type Shot} from '../film';
import {C, F} from '../theme';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const BEAMS = [
  {v: 8.2, h: 0.93, c: '238,168,72', label: '高门槛', note: '「挺有意思」'},
  {v: 5.1, h: 0.58, c: '206,198,184', label: '低门槛', note: '「就那样吧」'},
  {v: 3.3, h: 0.37, c: '150,145,134', label: '无门槛', note: '「浪费时间」'},
];

const Beams: React.FC<{local: number; dur: number}> = ({local, dur}) => {
  const floor = 686;

  return (
    <AbsoluteFill style={{backgroundColor: '#040507'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(1200px 700px at 50% 92%, rgba(233,166,60,0.10), rgba(4,5,7,0) 70%)',
        }}
      />

      {BEAMS.map((b, i) => {
        const p = spring({frame: local - 10 - i * 9, fps: 30, config: {damping: 26, mass: 0.9}});
        const h = 430 * b.h * p;
        const cx = 500 + i * 460;
        const flicker = 0.94 + 0.06 * Math.sin((local + i * 30) / 7);
        return (
          <React.Fragment key={b.label}>
            {/* 光柱 */}
            <div
              style={{
                position: 'absolute',
                left: cx - 120,
                bottom: 1080 - floor,
                width: 240,
                height: Math.max(0, h),
                opacity: flicker,
                background: `linear-gradient(to top, rgba(${b.c},0.62) 0%, rgba(${b.c},0.30) 45%, rgba(${b.c},0.02) 100%)`,
                maskImage:
                  'linear-gradient(to right, transparent 0%, #000 38%, #000 62%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, #000 38%, #000 62%, transparent 100%)',
                filter: 'blur(9px)',
              }}
            />
            {/* 光核 */}
            <div
              style={{
                position: 'absolute',
                left: cx - 3,
                bottom: 1080 - floor,
                width: 6,
                height: Math.max(0, h * 0.97),
                background: `linear-gradient(to top, rgba(255,255,255,0.85), rgba(${b.c},0.15))`,
                filter: 'blur(2px)',
                opacity: 0.55 * p,
              }}
            />
            {/* 地面光斑 */}
            <div
              style={{
                position: 'absolute',
                left: cx - 190,
                top: floor - 26,
                width: 380,
                height: 72,
                borderRadius: '50%',
                background: `radial-gradient(ellipse at center, rgba(${b.c},0.45), rgba(${b.c},0) 70%)`,
                opacity: p,
              }}
            />
            {/* 数值 */}
            <div
              style={{
                position: 'absolute',
                left: cx - 120,
                width: 240,
                bottom: 1080 - floor + h + 26,
                textAlign: 'center',
                fontFamily: F.mono,
                fontSize: 52,
                color: `rgb(${b.c})`,
                opacity: p,
                textShadow: `0 0 30px rgba(${b.c},0.5)`,
              }}
            >
              {b.v.toFixed(1)}
            </div>
            {/* 标签 */}
            <div
              style={{
                position: 'absolute',
                left: cx - 160,
                width: 320,
                top: floor + 30,
                textAlign: 'center',
                opacity: p,
                zIndex: 5,
              }}
            >
              <div
                style={{
                  fontFamily: F.serif,
                  fontSize: 31,
                  fontWeight: 700,
                  color: C.ink,
                  textShadow: '0 2px 18px rgba(0,0,0,0.9)',
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  fontFamily: F.sans,
                  fontSize: 19,
                  color: 'rgba(244,238,227,0.62)',
                  marginTop: 9,
                }}
              >
                {b.note}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* 地面 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: floor,
          height: 1,
          background: 'rgba(244,238,227,0.14)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: floor,
          height: 240,
          background:
            'linear-gradient(to bottom, rgba(4,5,7,0.55), rgba(4,5,7,0.95) 60%, rgba(4,5,7,1))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 96,
          fontFamily: F.sans,
          fontSize: 17,
          letterSpacing: '0.34em',
          color: 'rgba(244,238,227,0.42)',
          opacity: interpolate(local, [10, 26], [0, 1], clamp),
        }}
      >
        对讨论的评价 · 同一段录音
      </div>
    </AbsoluteFill>
  );
};

const ShotLayer: React.FC<{shot: Shot; local: number; dur: number; opacity: number}> = ({
  shot,
  local,
  dur,
  opacity,
}) => {
  const t = Math.min(1, Math.max(0, local / Math.max(1, dur)));
  const move = shot.move ?? 'in';
  const scale =
    move === 'in' ? 1.05 + 0.09 * t : move === 'out' ? 1.14 - 0.09 * t : 1.09;

  let tx = 0;
  let ty = 0;
  if (move === 'left') tx = 1.1 - 2.2 * t;
  if (move === 'right') tx = -1.1 + 2.2 * t;
  if (move === 'up') ty = 1.1 - 2.2 * t;
  if (move === 'down') ty = -1.1 + 2.2 * t;

  if (shot.kind === 'beams') {
    return (
      <AbsoluteFill style={{opacity}}>
        <Beams local={local} dur={dur} />
      </AbsoluteFill>
    );
  }

  if (shot.kind === 'void' || !shot.img) {
    return (
      <AbsoluteFill
        style={{
          opacity,
          background:
            'radial-gradient(900px 620px at 50% 55%, rgba(233,166,60,0.09), rgba(3,4,6,0) 70%), #030406',
        }}
      />
    );
  }

  return (
    <AbsoluteFill style={{opacity, overflow: 'hidden'}}>
      <Img
        src={staticFile(`frames/${shot.img}`)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${tx}%, ${ty}%)`,
          filter: `brightness(${shot.exposure ?? 1}) contrast(1.06) saturate(0.94)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: '#030406'}}>
      {SHOTS.map((shot) => {
        const f0 = Math.round(shot.from * 30);
        const f1 = Math.round(shot.to * 30);
        const isFirst = shot.from === 0;
        const inDur = isFirst ? 1 : 11;
        const visFrom = isFirst ? -100 : f0 - 11;

        if (frame < visFrom || frame > f1 + 11) return null;

        const pIn = isFirst ? 1 : interpolate(frame, [f0 - 11, f0], [0, 1], clamp);
        const pOut = interpolate(frame, [f1, f1 + 11], [1, 0], clamp);
        const opacity = Math.min(pIn, pOut);
        if (opacity <= 0) return null;

        return (
          <ShotLayer
            key={shot.id}
            shot={shot}
            local={frame - f0 + inDur}
            dur={f1 - f0}
            opacity={opacity}
          />
        );
      })}
    </AbsoluteFill>
  );
};
