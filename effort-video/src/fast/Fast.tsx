import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from './beats';
import {CUES, FAST_SHOTS, VIDEO_SECONDS, type Cam} from './shots';
import {FAST_SCENES} from './scenes';
import {DraftCtx} from './draftCtx';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const beatFrame = (b: number) => Math.round((0.054 + 0.5317 * b) * FPS);

/** 切点轻推：6 帧内 1.045 → 1，不做抖动，避免"闪得慌" */
const camTransform = (cam: Cam, local: number, dur: number) => {
  const punch = interpolate(local, [0, 6], [0.045, 0], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const drift = local / Math.max(1, dur);
  let s = 1 + punch;
  let dx = 0;
  let dy = 0;
  switch (cam) {
    case 'in':
      s += drift * 0.05;
      dy = -drift * 8;
      break;
    case 'out':
      s += (1 - drift) * 0.05;
      dy = drift * 6;
      break;
    case 'left':
      s += 0.03;
      dx = 20 - drift * 40;
      break;
    case 'right':
      s += 0.03;
      dx = -20 + drift * 40;
      break;
    case 'still':
      s += 0.008;
      break;
    default:
      s += drift * 0.02;
  }
  return `translate(${dx}px, ${dy}px) scale(${s})`;
};

/** 有"地面"的实景场景：给主体一个落点，别浮在黑里 */
const GROUND_GLOW = new Set([
  'bowl',
  'queue',
  'counter',
  'street',
  'bars',
  'desk',
  'profile',
  'scale',
  'ask2',
]);
/** 只有真的站在地上的场景才画地平线 —— 抽象信息图上画一条会像画面被切了一刀 */
const GROUND_LINE = new Set(['bowl', 'queue', 'counter', 'street', 'desk', 'profile', 'scale', 'ask2']);

/**
 * 地面层（草稿）：一片暖灰反光 + 一条几乎看不见的地平线。
 * 只加同色系暗部，不加新色。
 */
const Ground: React.FC<{scene: string}> = ({scene}) => {
  if (!GROUND_GLOW.has(scene)) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: -100,
          right: -100,
          bottom: -60,
          height: 620,
          background:
            'radial-gradient(66% 100% at 50% 100%, rgba(255,193,112,0.44) 0%, rgba(150,104,56,0.2) 40%, rgba(0,0,0,0) 80%)',
          filter: 'blur(38px)',
        }}
      />
      {GROUND_LINE.has(scene) ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 296,
            height: 2.5,
            background:
              'linear-gradient(to right, rgba(255,206,140,0) 0%, rgba(255,206,140,0.16) 22%, rgba(255,206,140,0.34) 50%, rgba(255,206,140,0.16) 78%, rgba(255,206,140,0) 100%)',
            filter: 'blur(2.5px)',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * 前景遮挡层（草稿）：三块完全失焦的暗部，贴在画面边缘。
 * 作用不是"加东西"，是造景深 + 让四角不空。
 */
const FG_OFF = new Set(['crowd', 'lab', 'gates', 'waves']);

const Foreground: React.FC<{k: number; scene: string}> = ({k, scene}) => {
  const v = k % 3;
  if (FG_OFF.has(scene)) return null;
  // 只压四角：任何进入画面中心的遮挡都会盖住主体，这个风格扛不住
  const corner = (x: number, y: number, w: number, h: number, o: number, blur: number) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background:
          'radial-gradient(closest-side, rgba(5,3,7,0.96) 0%, rgba(5,3,7,0.72) 38%, rgba(5,3,7,0.28) 66%, rgba(5,3,7,0) 100%)',
        filter: `blur(${blur}px)`,
        opacity: o,
      }}
    />
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {corner(-420, -300, 1150, 900, 1, 30)}
      {corner(1500 - v * 20, 700 - v * 10, 900, 760, 0.95, 34)}
      {corner(1720, -260 + v * 12, 700, 640, 0.7, 44)}
    </AbsoluteFill>
  );
};

const Shot: React.FC<{index: number; frame: number; draft: boolean}> = ({index, frame, draft}) => {
  const shot = FAST_SHOTS[index];
  const a = beatFrame(shot.b0);
  const b = beatFrame(shot.b1);
  if (frame < a || frame >= b) return null;
  const local = frame - a;
  const dur = b - a;
  const Comp = FAST_SCENES[shot.scene];
  if (!Comp) return null;
  // 默认硬切。只有画面本身是"从黑里亮起来"的镜头才淡入——
  // 之前每个切点都淡 2 帧，23 个镜头就是 23 次闪黑，看多了会审美疲劳。
  const op = shot.soft ? interpolate(local, [0, 4], [0, 1], clamp) : 1;

  return (
    <AbsoluteFill style={{opacity: op, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: camTransform(shot.cam ?? 'punch', local, dur)}}>
        <Comp local={local + (shot.pre ?? 0)} dur={dur} text={shot.text} sub={shot.sub} value={shot.value} mode={shot.mode} />
        {draft ? <Ground scene={shot.scene} /> : null}
      </AbsoluteFill>
      {/* 提亮只在显式标了 flash 的镜头上给（全片 3 个），其余切点靠鼓点和硬切本身 */}
      {shot.flash ? (
        <AbsoluteFill
          style={{
            backgroundColor: '#FFF3DC',
            opacity: interpolate(local, [0, 1, 3], [0.16, 0.06, 0], clamp),
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** 关键词用暖金色：**...** 之间高亮 */
const ACCENT = '#FFC85C';
const Rich: React.FC<{text: string}> = ({text}) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
      seg.startsWith('**') && seg.endsWith('**') ? (
        <span
          key={i}
          style={{
            color: ACCENT,
            textShadow:
              '0 0 22px rgba(0,0,0,0.92), 0 4px 20px rgba(0,0,0,0.95), 0 0 26px rgba(255,200,92,0.26)',
          }}
        >
          {seg.slice(2, -2)}
        </span>
      ) : (
        <React.Fragment key={i}>{seg}</React.Fragment>
      ),
    )}
  </>
);

const Captions: React.FC<{frame: number}> = ({frame}) => {
  const cue = CUES.find((c) => frame >= beatFrame(c.b0) && frame < beatFrame(c.b1));
  if (!cue) return null;
  const a = beatFrame(cue.b0);
  const b = beatFrame(cue.b1);
  const local = frame - a;
  const op = Math.min(
    interpolate(local, [0, 4], [0, 1], clamp),
    interpolate(frame, [b - 5, b - 1], [1, 0], clamp),
  );
  const rise = interpolate(local, [0, 5], [16, 0], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const hero = cue.kind === 'hero';

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* 字幕底衬：只在字后面压一块柔和的暗，不把整个画面下半截糊掉 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: hero ? 54 : 70,
          width: 1280,
          height: 232,
          transform: 'translateX(-50%)',
          opacity: op,
          background:
            'radial-gradient(56% 100% at 50% 60%, rgba(4,4,7,0.93) 0%, rgba(4,4,7,0.74) 40%, rgba(4,4,7,0.3) 70%, rgba(4,4,7,0) 100%)',
          filter: 'blur(16px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: hero ? 92 : 108,
          display: 'flex',
          justifyContent: 'center',
          opacity: op,
          transform: `translateY(${rise}px)`,
          fontFamily: '"Noto Sans SC", sans-serif',
          fontWeight: 700,
          fontSize: hero ? 112 : 84,
          lineHeight: 1.3,
          letterSpacing: hero ? '0.06em' : '0.03em',
          color: '#FFF6E6',
          textShadow: hero
            ? '0 0 40px rgba(0,0,0,0.9), 0 8px 40px rgba(0,0,0,0.95), 0 0 90px rgba(255,214,150,0.22)'
            : '0 0 28px rgba(0,0,0,0.85), 0 6px 30px rgba(0,0,0,0.9), 0 0 60px rgba(255,246,230,0.18)',
          whiteSpace: 'nowrap',
        }}
      >
        <Rich text={cue.text} />
      </div>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(4,4,7,0.55) 0%, rgba(4,4,7,0.22) 22%, rgba(4,4,7,0) 42%)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 105% at 50% 46%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.30) 84%, rgba(0,0,0,0.58) 100%)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('grain.png')})`,
          backgroundRepeat: 'repeat',
          backgroundPosition: `${(frame * 7) % 200}px ${(frame * 13) % 200}px`,
          opacity: 0.06,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

export const EffortFast: React.FC<{draft?: boolean; noCaption?: boolean}> = ({draft = false, noCaption = false}) => {
  const frame = useCurrentFrame();
  return (
    <DraftCtx.Provider value={draft}>
      <AbsoluteFill style={{backgroundColor: '#050507'}}>
        {FAST_SHOTS.map((s, i) => (
          <Shot key={s.id} index={i} frame={frame} draft={draft} />
        ))}
        <Grain />
        {!noCaption ? <Captions frame={frame} /> : null}
      </AbsoluteFill>
    </DraftCtx.Provider>
  );
};

export const FAST_DURATION = Math.round(VIDEO_SECONDS * FPS);
