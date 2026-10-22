export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type CamMove = 'in' | 'out' | 'left' | 'right' | 'still';

export type Shot = {
  id: string;
  scene: string;
  from: number;
  to: number;
  cam?: CamMove;
};

export const SHOTS: Shot[] = [
  {id: 's01', scene: 'shop', from: 0, to: 11, cam: 'in'},
  {id: 's02', scene: 'desk', from: 11, to: 20, cam: 'out'},
  {id: 's03', scene: 'void', from: 20, to: 26, cam: 'still'},
  {id: 's04', scene: 'corridor', from: 26, to: 42, cam: 'in'},
  {id: 's05', scene: 'tape', from: 42, to: 52, cam: 'right'},
  {id: 's06', scene: 'pillars', from: 52, to: 64, cam: 'still'},
  {id: 's07', scene: 'profile', from: 64, to: 76, cam: 'in'},
  {id: 's08', scene: 'scale', from: 76, to: 84, cam: 'out'},
  {id: 's09', scene: 'city', from: 84, to: 96, cam: 'left'},
  {id: 's10', scene: 'water', from: 96, to: 108, cam: 'in'},
  {id: 's11', scene: 'chips', from: 108, to: 118, cam: 'in'},
  {id: 's12', scene: 'gate', from: 118, to: 130, cam: 'in'},
  {id: 's13', scene: 'notebook', from: 130, to: 144, cam: 'right'},
  {id: 's14', scene: 'opening', from: 144, to: 158, cam: 'in'},
];

export type CueKind = 'sub' | 'big' | 'hero';

export type Cue = {
  from: number;
  to: number;
  text: string;
  kind?: CueKind;
  en?: string;
};

export const CUES: Cue[] = [
  {from: 0, to: 5.5, text: '排两小时的队，'},
  {from: 5.5, to: 11, text: '那碗面就**格外香**。'},

  {from: 11, to: 15.5, text: '熬夜三个月做出来的东西，'},
  {from: 15.5, to: 20, text: '你越看**越顺眼**。'},

  {from: 20, to: 26, kind: 'hero', text: '努力辩护效应', en: 'EFFORT  JUSTIFICATION'},

  {from: 26, to: 29.5, text: '1959 年，阿伦森和米尔斯'},
  {from: 29.5, to: 33, text: '找来一群女大学生'},
  {from: 33, to: 36.5, text: '入组之前，先过一道**门槛**'},
  {from: 36.5, to: 39.5, text: '有人当众朗读露骨的文字'},
  {from: 39.5, to: 42, text: '有人只读温和的词'},

  {from: 42, to: 47, text: '三组人听的，是**同一段录音**'},
  {from: 47, to: 52, text: '内容一模一样'},

  {from: 52, to: 58, text: '门槛越高的那组，评价越高'},
  {from: 58, to: 64, text: '同一段录音，被评出两种价值'},

  {from: 64, to: 69, text: '为什么？因为**认知失调**'},
  {from: 69, to: 76, text: '「我付出这么多，它不可能是垃圾」'},

  {from: 76, to: 80, text: '大脑不会承认自己傻，'},
  {from: 80, to: 84, kind: 'big', text: '它只会改价格。'},

  {from: 84, to: 90, text: '不改结果，只改评价，'},
  {from: 90, to: 96, text: '于是它**无处不在**。'},

  {from: 96, to: 102, text: '但它也会**咬你一口**。'},
  {from: 102, to: 108, text: '投入越多，越难抽身。'},

  {from: 108, to: 113, text: '再熬一年，再投一笔。'},
  {from: 113, to: 118, text: '越加注，越走不掉。'},

  {from: 118, to: 124, text: '骗局先让你付出，'},
  {from: 124, to: 130, text: '再让你舍不得走。'},

  {from: 130, to: 137, text: '三个动作：拆掉付出、事前定价，'},
  {from: 137, to: 144, text: '再提前写下**退出线**。'},

  {from: 144, to: 151, text: '让努力改变事情，'},
  {from: 151, to: 158, text: '而不是改变判断。'},
];

export const DURATION_SECONDS = SHOTS[SHOTS.length - 1].to;
export const DURATION = Math.round(DURATION_SECONDS * FPS);
