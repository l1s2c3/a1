import {Composition} from 'remotion';
import {TerminalFilm} from './Composition';
import timeline from './timeline.json';

export const Root = () => {
  return (
    <Composition
      id="TerminalFilm"
      component={TerminalFilm}
      durationInFrames={timeline.total_frames}
      fps={timeline.fps}
      width={timeline.width}
      height={timeline.height}
    />
  );
};
