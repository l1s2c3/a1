import React from 'react';
import {Composition} from 'remotion';
import {EffortFilm} from './Video';
import {EffortFast, FAST_DURATION} from './fast/Fast';
import {CoverH, CoverV} from './Cover';
import {DURATION, FPS, HEIGHT, WIDTH} from './timeline';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="EffortJustification"
        component={EffortFilm}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="EffortFast"
        component={EffortFast}
        durationInFrames={FAST_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* 草稿专用：只用来试镜头密度，不会进正片 */}
      <Composition
        id="EffortDraft"
        component={EffortFast}
        defaultProps={{draft: true}}
        durationInFrames={FAST_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* 封面：横版 16:9 / 竖版 9:16 */}
      <Composition id="CoverH" component={CoverH} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="CoverV" component={CoverV} durationInFrames={1} fps={30} width={1080} height={1920} />
    </>
  );
};
