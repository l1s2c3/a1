"""按拍点把程序合成的音效叠到音乐上，输出开场音轨"""
import os, wave
import numpy as np

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
T0, BEAT = 0.054, 0.5317
DUR = 81.94


def at(beat, off=0.0):
    return T0 + BEAT * beat + off


# 与 src/fast/shots.ts 的 SFX 表一一对应
CUES = [
    (at(2), 'slam', 0.80),
    (at(6), 'whoosh', 0.28),
    (at(16), 'chop', 0.75),
    (at(18, 0.18), 'bell_hi', 0.42),
    (at(24), 'metal', 0.50),
    (at(30), 'bell', 0.50),
    (at(34), 'slam', 0.60),
    (at(42), 'whoosh', 0.26),
    (at(58), 'whoosh', 0.22),
    (at(66), 'metal', 0.40),
    (at(70), 'clunk', 0.55),
    (at(74), 'slam', 0.70),
    (at(78), 'clunk', 0.50),
    (at(86), 'metal', 0.50),
    (at(90), 'bell_hi', 0.55),
    (at(98), 'whoosh', 0.22),
    (at(102), 'metal', 0.45),
    (at(106), 'clunk', 0.50),
    (at(110), 'chop', 0.50),
    (at(114), 'metal', 0.40),
    (at(118), 'bell', 0.35),
    (at(122), 'whoosh', 0.25),
    (at(126), 'bell', 0.40),
    (at(130), 'clunk', 0.45),
    (at(134), 'whoosh', 0.20),
    (at(138), 'metal', 0.35),
    (at(142), 'whoosh', 0.25),
    (at(146), 'bell', 0.50),
]

MUSIC_GAIN = 0.72


def read_wav(path):
    with wave.open(path, 'rb') as w:
        n = w.getnframes()
        ch = w.getnchannels()
        sr = w.getframerate()
        d = np.frombuffer(w.readframes(n), dtype='<i2').astype(np.float32) / 32768.0
    if ch == 1:
        d = np.stack([d, d], axis=1)
    else:
        d = d.reshape(-1, ch)[:, :2]
    assert sr == SR, sr
    return d


# 音乐：E:\剪应\10月22日.mp4（与 10月21日 同曲、细节更好）。
# 已裁掉开头 1105 样本（25.1ms）与旧版节拍网格对齐（互相关 0.988），T0/BEAT 不变。
music = read_wav(os.path.join(BASE, 'audio', 'ref2_align.wav'))
N = int(SR * DUR)
mix = np.zeros((N, 2), dtype=np.float32)
mix += music[:N] * MUSIC_GAIN

for t, name, gain in CUES:
    p = os.path.join(BASE, 'audio', 'sfx', name + '.wav')
    s = read_wav(p) * gain
    i = int(t * SR)
    if i >= N:
        continue
    j = min(N, i + len(s))
    mix[i:j] += s[:j - i]

# 轻微软限幅，保留瞬态
peak = np.abs(mix).max()
if peak > 0:
    mix = np.tanh(mix / peak * 1.15) / np.tanh(1.15)

# 结尾 0.12s 淡出
f = int(SR * 0.12)
mix[-f:] *= np.linspace(1, 0, f)[:, None]

mix *= 0.94 / (np.abs(mix).max() + 1e-9)
pcm = np.clip(mix * 32767, -32768, 32767).astype('<i2')
out = os.path.join(BASE, 'audio', 'opening.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('mix ok', out, '%.2fs' % (N / SR), 'peak %.2f' % np.abs(mix).max())
