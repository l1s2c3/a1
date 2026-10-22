import {beatTime} from './beats';

export type Cam = 'in' | 'out' | 'punch' | 'left' | 'right' | 'still';

export type FastShot = {
  id: string;
  scene: string;
  b0: number;
  b1: number;
  cam?: Cam;
  value?: number;
  mode?:
    | 'full'
    | 'empty'
    | 'top'
    | 'side'
    | 'close'
    | 'into'
    | 'focus'
    | 'wide'
    | 'left'
    | 'right'
    | 'swap'
    | 'one'
    | 'all'
    | 'ask'
    | 'show'
    | 'push'
    | 'wall'
    | 'unload'
    | 'line';
  text?: string;
  sub?: string;
  pre?: number;
  /** 硬切：不做淡入，用于"鼓砸下来"这种要干脆的切点（默认就是硬切） */
  hard?: boolean;
  /** 从黑里浮出来：只有"场景本身是渐亮的"才用，普通镜头一律硬切，避免闪黑 */
  soft?: boolean;
  /** 切点上的一次极短提亮。全片只给 3 个真正的重音，其余一律不闪 */
  flash?: boolean;
};

/**
 * 一个小节（4 拍 = 2.13s）只换一次画面。
 * 切点全部落在每小节第 1 拍（重拍 k=6,10,14,18,22,26）上；
 * 画面靠内部运动推进，不靠切。
 */
export const FAST_SHOTS: FastShot[] = [
  {id: 's00', scene: 'ask1', b0: 0, b1: 6, cam: 'in', soft: true}, //  0.05–3.24 弱起：一束光点亮一只歪板凳
  {id: 's01', scene: 'ask2', b0: 6, b1: 10, cam: 'right'}, //  3.24–5.37 墙上密密麻麻的正字
  {id: 's02', scene: 'queue', b0: 10, b1: 14, cam: 'in'}, //  5.37–7.50 排了两个小时的队
  {id: 's03', scene: 'bowl', b0: 14, b1: 18, mode: 'full', cam: 'in'}, //  7.50–9.62 就为这一碗面
  {id: 's04', scene: 'bowl', b0: 18, b1: 22, mode: 'empty', cam: 'out'}, //  9.62–11.75 吃完觉得：值
  {id: 's05', scene: 'brain', b0: 22, b1: 26, cam: 'in'}, // 11.75–13.88 价钱在牌上翻过去
  {id: 's05b', scene: 'brain', b0: 26, b1: 30, cam: 'in', pre: 64}, // 13.88–16.00 让"价改了"落下来
  {id: 's06', scene: 'title', b0: 30, b1: 34, text: '努力辩护效应', sub: 'EFFORT  JUSTIFICATION', flash: true}, // 16.00–18.13 片名
  {id: 's07', scene: 'crowd', b0: 34, b1: 36, cam: 'in'}, // 18.13–19.20 黑压压的人群
  // 1959 那句是一句话，就用一个镜头说完：全景起步，一镜内慢慢推到磁带机上，中间不切
  {id: 's08', scene: 'lab', b0: 36, b1: 42, cam: 'still', mode: 'into', hard: true}, // 19.20–22.39 阿伦森和米尔斯做了个实验
  // 门槛不是"跨栏"，是尴尬：三组各挂一张牌子，写清楚要做什么才能进
  {id: 's09', scene: 'gates', b0: 42, b1: 46, cam: 'in', mode: 'wide'}, // 22.39–24.51 加入之前先过筛选
  {id: 's09b', scene: 'gates', b0: 46, b1: 50, cam: 'still', mode: 'focus', value: 0}, // 24.51–26.64 推近 A 组：当众读露骨的词
  {id: 's09c', scene: 'gates', b0: 50, b1: 54, cam: 'still', mode: 'focus', value: 1}, // 26.64–28.77 推近 B 组：只读普通词
  {id: 's09d', scene: 'gates', b0: 54, b1: 58, cam: 'out', mode: 'wide'}, // 28.77–30.90 拉回：C 组不用筛选
  {id: 's10', scene: 'waves', b0: 58, b1: 62, cam: 'still', mode: 'one'}, // 30.90–33.03 进去以后听一段很无聊的讨论
  {id: 's10b', scene: 'waves', b0: 62, b1: 66, cam: 'still', mode: 'all'}, // 33.03–35.16 三组听的，是同一段
  {id: 's11', scene: 'bars', b0: 66, b1: 70, cam: 'in', mode: 'ask'}, // 35.16–37.29 听完，给这段讨论打分
  {id: 's11b', scene: 'bars', b0: 70, b1: 74, cam: 'in', mode: 'show', hard: true, flash: true}, // 37.29–39.42 越尴尬，分越高
  {id: 's12', scene: 'balance', b0: 74, b1: 78, cam: 'in', mode: 'wide', hard: true, flash: true}, // 39.42–41.55 一架已经歪掉的天平
  {id: 's13', scene: 'balance', b0: 78, b1: 82, cam: 'in', mode: 'left'}, // 41.55–43.68 左盘，粗石砸进来
  {id: 's14', scene: 'balance', b0: 82, b1: 86, cam: 'in', mode: 'right'}, // 43.68–45.81 右盘，只有一粒
  {id: 's15', scene: 'balance', b0: 86, b1: 90, cam: 'in', mode: 'wide', value: 2}, // 45.81–47.94 全景，歪得更厉害
  {id: 's16', scene: 'balance', b0: 90, b1: 94, cam: 'in', mode: 'swap', hard: true}, // 47.94–50.07 那一粒被点亮
  // ——— 第 4 段：危害（它也会咬你一口）———
  {id: 's17', scene: 'balance', b0: 94, b1: 98, cam: 'still', mode: 'swap', pre: 60}, // 50.03–52.16 天平已回正：只改了评价
  {id: 's18', scene: 'everywhere', b0: 98, b1: 102, cam: 'in'}, // 52.16–54.29 板凳/面碗/天平，三处都在发生
  {id: 's19', scene: 'hook', b0: 102, b1: 106, cam: 'in'}, // 54.29–56.42 发光的值挂在钩上
  {id: 's20', scene: 'sink', b0: 106, b1: 110, cam: 'still'}, // 56.42–58.55 石头越放，人越沉
  {id: 's21', scene: 'chips', b0: 110, b1: 114, cam: 'in', mode: 'push'}, // 58.55–60.68 筹码一枚枚推进光里
  {id: 's22', scene: 'chips', b0: 114, b1: 118, cam: 'still', mode: 'wall'}, // 60.68–62.81 筹码叠成栏杆，隔在人和门之间
  {id: 's23', scene: 'offer', b0: 118, b1: 122, cam: 'in'}, // 62.81–64.94 上面递饵，下面伸手去够
  {id: 's24', scene: 'leash', b0: 122, b1: 126, cam: 'out'}, // 64.94–67.07 朝门走，脚踝拴着线
  // ——— 第 5 段：对策与收尾 ———
  {id: 's25', scene: 'actions', b0: 126, b1: 130, cam: 'in'}, // 67.07–69.20 三个动作
  {id: 's26', scene: 'balance', b0: 130, b1: 134, cam: 'still', mode: 'unload'}, // 69.20–71.33 拆掉付出：左盘被端走，光熄灭
  {id: 's27', scene: 'price', b0: 134, b1: 138, cam: 'in'}, // 71.33–73.46 事前定价：先写下数
  {id: 's28', scene: 'leash', b0: 138, b1: 142, cam: 'in', mode: 'line'}, // 73.46–75.58 写下退出线
  {id: 's29', scene: 'mend', b0: 142, b1: 146, cam: 'in', soft: true}, // 75.58–77.71 扶板凳、垫木块
  {id: 's30', scene: 'mend', b0: 146, b1: 150, cam: 'still', pre: 64}, // 77.71–79.84 板凳站直了，手退场
  {id: 's31', scene: 'mend', b0: 150, b1: 154, cam: 'still', pre: 118}, // 79.84–81.97 空镜：光熄掉，全片收尾
];

export const VIDEO_SECONDS = 81.94;

export type Cue = {b0: number; b1: number; text: string; kind?: 'hero'};

/** 字幕与画面一比一：一小节一句，2.13 秒读完；**...** 之间是关键词（用暖金色） */
export const CUES: Cue[] = [
  {b0: 2, b1: 6, text: '你舍不得的，是**它**', kind: 'hero'},
  {b0: 6, b1: 10, text: '还是自己吃过的**苦**？', kind: 'hero'},
  {b0: 10, b1: 14, text: '排了**两个小时**的队'},
  {b0: 14, b1: 18, text: '就为**这一碗面**'},
  {b0: 18, b1: 22, text: '吃完觉得：**值**'},
  {b0: 22, b1: 30, text: '其实是大脑**改了价**'}, // 停两小节：这一段给观众留呼吸，不再出新字幕
  {b0: 34, b1: 36, text: '不止你**一个人**'},
  {b0: 36, b1: 42, text: '**1959 年**，阿伦森和米尔斯做了个**实验**'},
  {b0: 42, b1: 46, text: '想加入？**先过筛选**'},
  {b0: 46, b1: 50, text: 'A 组：当众读**露骨的词**'},
  {b0: 50, b1: 54, text: 'B 组：只读**普通词**'},
  {b0: 54, b1: 58, text: 'C 组：**不用筛选**，直接进'},
  {b0: 58, b1: 62, text: '进去以后，听一段**很无聊的**讨论'},
  {b0: 62, b1: 66, text: '三组听的，是**同一段**'},
  {b0: 66, b1: 70, text: '听完，给这段讨论**打分**'},
  {b0: 70, b1: 74, text: '越尴尬的那组，**分越高**'},
  {b0: 74, b1: 78, text: '讨论一模一样，**分却不一样**'},
  {b0: 78, b1: 82, text: '左边，是**受过的尴尬**'},
  {b0: 82, b1: 86, text: '右边，是它**真正值多少**'},
  {b0: 86, b1: 90, text: '可两边的**分量差太多**'},
  {b0: 90, b1: 94, text: '怕被当成**傻瓜**，只好把它标贵'},
  {b0: 94, b1: 98, text: '不改**结果**，只改**评价**'},
  {b0: 98, b1: 102, text: '于是它**无处不在**'},
  {b0: 102, b1: 106, text: '但它也会**咬你一口**'},
  {b0: 106, b1: 110, text: '投入越多，越**难抽身**'},
  {b0: 110, b1: 114, text: '再熬一年，**再投一笔**'},
  {b0: 114, b1: 118, text: '越加注，越**走不掉**'},
  {b0: 118, b1: 122, text: '骗局先让你**付出**'},
  {b0: 122, b1: 126, text: '再让你**舍不得走**'},
  {b0: 126, b1: 130, text: '那怎么办？**三个动作**'},
  {b0: 130, b1: 134, text: '第一，**拆掉付出**'},
  {b0: 134, b1: 138, text: '第二，**事前定价**'},
  {b0: 138, b1: 142, text: '第三，提前写下**退出线**'},
  {b0: 142, b1: 146, text: '让努力**改变事情**', kind: 'hero'},
  {b0: 146, b1: 150, text: '而不是**改变判断**', kind: 'hero'},
];

export type Sfx = {t: number; name: string; gain?: number};
const at = (beat: number, off = 0) => beatTime(beat) + off;

/** 音效只给真正的关键动作，一节最多一个，别把音乐压住 */
export const SFX: Sfx[] = [
  {t: at(2), name: 'slam', gain: 0.8}, // 反问第一句砸入
  {t: at(6), name: 'whoosh', gain: 0.28}, // 切到正字墙
  {t: at(16), name: 'chop', gain: 0.75}, // 筷子挑面
  {t: at(18, 0.18), name: 'bell_hi', gain: 0.42}, // 「值」盖下
  {t: at(24), name: 'metal', gain: 0.5}, // 价签翻价
  {t: at(30), name: 'bell', gain: 0.5}, // 片名
  {t: at(34), name: 'slam', gain: 0.6}, // 人群出现
  {t: at(42), name: 'whoosh', gain: 0.26}, // 三扇门推开
  {t: at(58), name: 'whoosh', gain: 0.22}, // 进到屋内，波形亮起
  {t: at(66), name: 'metal', gain: 0.4}, // 打分
  {t: at(70), name: 'clunk', gain: 0.55}, // 柱子冲起来
  {t: at(74), name: 'slam', gain: 0.7}, // 天平砸下
  {t: at(78), name: 'clunk', gain: 0.5}, // 石头落进盘里
  {t: at(86), name: 'metal', gain: 0.5}, // 天平歪得更狠
  {t: at(90), name: 'bell_hi', gain: 0.55}, // 那一粒被点亮
  {t: at(98), name: 'whoosh', gain: 0.22}, // 无处不在亮起
  {t: at(102), name: 'metal', gain: 0.45}, // 钩显出
  {t: at(106), name: 'clunk', gain: 0.5}, // 第一块石头下沉
  {t: at(110), name: 'chop', gain: 0.5}, // 推出筹码
  {t: at(114), name: 'metal', gain: 0.4}, // 筹码墙升起
  {t: at(118), name: 'bell', gain: 0.35}, // 饵在暗处亮着
  {t: at(122), name: 'whoosh', gain: 0.25}, // 朝门走
  {t: at(126), name: 'bell', gain: 0.4}, // 三个动作亮起
  {t: at(130), name: 'clunk', gain: 0.45}, // 左盘被端走
  {t: at(134), name: 'whoosh', gain: 0.2}, // 写下数字
  {t: at(138), name: 'metal', gain: 0.35}, // 退出线亮起
  {t: at(142), name: 'whoosh', gain: 0.25}, // 板凳被扶正
  {t: at(146), name: 'bell', gain: 0.5}, // 收尾金句
];
