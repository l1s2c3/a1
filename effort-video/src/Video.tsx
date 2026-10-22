import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CUES, DURATION, FPS, SHOTS, type CamMove, type Cue} from './timeline';
import {SCENES} from './flat/scenes';
import {Hero, Narration, Statement} from './flat/type';
import {Atmosphere, Progress} from './components/Atmosphere';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const camStyle = (move: CamMove, t: number) => {
  const e = 1 - Math.pow(1 - t, 2);
  switch (move) {
    case 'in':
      return `scale(${1.02 + 0.055 * e}) translate(0px, ${-10 * e}px)`;
    case 'out':
      return `scale(${1.075 - 0.055 * e}) translate(0px, ${8 * e}px)`;
    case 'left':
      return `scale(1.07) translate(${22 - 44 * e}px, 0px)`;
    case 'right':
      return `scale(1.07) translate(${-22 + 44 * e}px, 0px)`;
    default:
      return `scale(${1.03 + 0.012 * e}) translate(${Math.sin(t * 3.1) * 6}px, ${-6 * e}px)`;
  }
};

const ShotLayer: React.FC<{index: number; frame: number}> = ({index, frame}) => {
  const shot = SHOTS[index];
  const f0 = Math.round(shot.from * FPS);
  const f1 = Math.round(shot.to * FPS);
  const isFirst = index === 0;
  const fade = 10;

  if (frame < f0 - fade || frame > f1 + fade) return null;

  const opacity = Math.min(
    isFirst ? 1 : interpolate(frame, [f0 - fade, f0], [0, 1], clamp),
    interpolate(frame, [f1 - 2, f1 + fade - 2], [1, 0], clamp),
  );
  if (opacity <= 0.001) return null;

  const local = frame - f0 + (isFirst ? 0 : fade);
  const dur = f1 - f0;
  const t = Math.min(1, Math.max(0, local / Math.max(1, dur)));
  const Comp = SCENES[shot.scene];

  return (
    <AbsoluteFill style={{opacity, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: camStyle(shot.cam ?? 'in', t)}}>
        <Comp local={local} dur={dur} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cue: Cue | undefined = CUES.find((c) => t >= c.from && t < c.to);
  if (!cue) return null;

  const f0 = Math.round(cue.from * FPS);
  const f1 = Math.round(cue.to * FPS);
  const local = frame - f0;
  const opacity = Math.min(
    interpolate(frame, [f0, f0 + 5], [0, 1], clamp),
    interpolate(frame, [f1 - 6, f1], [1, 0], clamp),
  );

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {cue.kind === 'hero' ? (
        <Hero title={cue.text} en={cue.en ?? ''} local={local} opacity={opacity} />
      ) : cue.kind === 'big' ? (
        <Statement text={cue.text} local={local} opacity={opacity} />
      ) : (
        <Narration text={cue.text} local={local} opacity={opacity} />
      )}
    </AbsoluteFill>
  );
};

export const EffortFilm: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: '#0B0B0F'}}>
      {SHOTS.map((s, i) => (
        <ShotLayer key={s.id} index={i} frame={frame} />
      ))}
      <Atmosphere />
      {/* 底部压暗：保证字幕在任何画面上都能读清 */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(to top, rgba(6,6,10,0.62) 0%, rgba(6,6,10,0.34) 16%, rgba(6,6,10,0.10) 30%, rgba(6,6,10,0) 44%)',
        }}
      />
      <Captions />
      <Progress total={DURATION} />
    </AbsoluteFill>
  );
};
