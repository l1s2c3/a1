export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Move = 'in' | 'out' | 'left' | 'right' | 'up' | 'down';

export type Shot = {
  id: string;
  img?: string;
  kind?: 'image' | 'beams' | 'void';
  from: number;
  to: number;
  move?: Move;
  /** 画面整体亮度系数，用于压暗偏亮的素材 */
  exposure?: number;
  /** 亮画面需要更强的字幕压底 */
  bright?: boolean;
};

export const SHOTS: Shot[] = [
  {id: 's01', img: 's01.jpg', from: 0, to: 7.5, move: 'in'},
  {id: 's02', img: 's02.jpg', from: 7.5, to: 14, move: 'out', exposure: 0.94},
  {id: 's03', kind: 'void', from: 14, to: 20},
  {id: 's04', img: 's03.jpg', from: 20, to: 27.5, move: 'in'},
  {id: 's05', img: 's04.jpg', from: 27.5, to: 37, move: 'in', exposure: 0.96},
  {id: 's06', img: 's05.jpg', from: 37, to: 44, move: 'right'},
  {id: 's07', kind: 'beams', from: 44, to: 54},
  {id: 's08', img: 's06.jpg', from: 54, to: 62, move: 'in'},
  {id: 's09', img: 's07.jpg', from: 62, to: 70, move: 'up'},
  {id: 's10', img: 's08.jpg', from: 70, to: 78, move: 'in'},
  {id: 's11', img: 's09.jpg', from: 78, to: 84, move: 'left', exposure: 0.68},
  {id: 's12', img: 's10.jpg', from: 84, to: 90, move: 'in'},
  {id: 's13', img: 's11.jpg', from: 90, to: 97, move: 'out'},
  {id: 's14', img: 's12.jpg', from: 97, to: 104.5, move: 'in', exposure: 0.72, bright: true},
  {id: 's15', img: 's13.jpg', from: 104.5, to: 110.5, move: 'in'},
  {id: 's16', img: 's14.jpg', from: 110.5, to: 116.5, move: 'in', bright: true},
  {id: 's17', img: 's15.jpg', from: 116.5, to: 126, move: 'in'},
  {id: 's18', img: 's16.jpg', from: 126, to: 133, move: 'in', bright: true},
  {id: 's19', kind: 'void', from: 133, to: 140},
];

export type CueKind = 'sub' | 'big' | 'hero';

export type Cue = {
  from: number;
  to: number;
  text: string;
  kind?: CueKind;
  /** hero/big 的副行小字 */
  sub?: string;
  /** hero/big 的位置：center 居中，left 靠左 */
  align?: 'center' | 'left';
};

/** **文字** = 暖金强调 */
export const CUES: Cue[] = [
  {from: 0, to: 3.6, text: '排两小时的队，那碗面就**格外香**。'},
  {from: 3.6, to: 7.5, text: '可只排十分钟，你还觉得香吗？'},
  {from: 7.5, to: 11.2, text: '熬夜三个月做出来的东西，你越看**越顺眼**。'},
  {from: 11.2, to: 14, text: '这不是错觉。'},

  {
    from: 14,
    to: 20,
    kind: 'hero',
    text: '努力辩护效应',
    sub: 'EFFORT  JUSTIFICATION',
    align: 'center',
  },

  {from: 20, to: 25, text: '1959 年，阿伦森和米尔斯做了个实验。'},
  {from: 25, to: 27.5, text: '他们找来一群女大学生。'},
  {from: 27.5, to: 31.5, text: '入组之前，先过一道**门槛**。'},
  {from: 31.5, to: 37, text: '有人要当众朗读露骨的文字，有人只读温和的词。'},
  {from: 37, to: 40.5, text: '三组人听的，是**同一段**极其无聊的录音。'},
  {from: 40.5, to: 44, text: '内容一模一样。'},

  {from: 44, to: 48.5, text: '结果，**越难进去的那组，评价越高**。'},
  {from: 48.5, to: 54, text: '同一段录音，被评出了两种价值。'},

  {from: 54, to: 57.5, text: '为什么？因为**认知失调**。'},
  {from: 57.5, to: 62, text: '「我付出了这么多，它不可能是垃圾。」'},

  {from: 62, to: 66, text: '大脑不会承认自己傻，'},
  {from: 66, to: 70, kind: 'big', text: '它只会改价格。', align: 'center'},
  {from: 70, to: 74, text: '不改结果，改评价。'},
  {from: 74, to: 78, text: '「浪费时间」被悄悄改成了「其实挺特别」。'},

  {from: 78, to: 84, text: '于是它无处不在：排队两小时的店、'},
  {from: 84, to: 90, text: '通宵刷出来的成就、'},
  {from: 90, to: 97, text: '还有那个你苦追很久的人。'},

  {from: 97, to: 101, text: '但它也会咬你一口。'},
  {from: 101, to: 104.5, kind: 'big', text: '投入越多，越难抽身。', align: 'left'},
  {from: 104.5, to: 110.5, text: '于是你继续加注：再熬一年，再投一笔。'},
  {from: 110.5, to: 116.5, text: '骗局和传销先让你付出，再让你舍不得走。'},

  {from: 116.5, to: 120, text: '三个动作：拆掉付出、事前定价，'},
  {from: 120, to: 126, text: '再提前写下**退出线**。'},

  {from: 126, to: 130, text: '让沉没成本只影响过去，'},
  {from: 130, to: 133, kind: 'big', text: '别影响判断。', align: 'center'},

  {from: 133, to: 136, text: '真正的努力，是让事情变好，'},
  {from: 136, to: 140, kind: 'big', text: '而不是让评价变好。', align: 'center'},
];

export const DURATION_SECONDS = SHOTS[SHOTS.length - 1].to;
export const DURATION = Math.round(DURATION_SECONDS * FPS);
