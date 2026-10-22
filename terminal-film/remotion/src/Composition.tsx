import {AbsoluteFill, Sequence} from 'remotion';
import timeline from './timeline.json';
import {Subtitles, Scanlines} from './widgets';
import {Seg001} from './scenes/Seg001';
import {Seg002} from './scenes/Seg002';
import {Seg003} from './scenes/Seg003';
import {Seg004} from './scenes/Seg004';

const seg = (id: string) => {
  const s = timeline.segments.find((x) => x.id === id)!;
  return {
    from: Math.round(s.start * timeline.fps),
    dur: Math.round((s.end - s.start) * timeline.fps),
  };
};

export const TerminalFilm: React.FC = () => {
  const s1 = seg('SEG001');
  const s2 = seg('SEG002');
  const s3 = seg('SEG003');
  const s4 = seg('SEG004');
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence from={s1.from} durationInFrames={s1.dur}>
        <Seg001 />
      </Sequence>
      <Sequence from={s2.from} durationInFrames={s2.dur}>
        <Seg002 />
      </Sequence>
      <Sequence from={s3.from} durationInFrames={s3.dur}>
        <Seg003 />
      </Sequence>
      <Sequence from={s4.from} durationInFrames={s4.dur + 30}>
        <Seg004 />
      </Sequence>
      <Subtitles narration={timeline.narration} />
      <Scanlines />
    </AbsoluteFill>
  );
};
