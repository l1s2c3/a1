"""节拍分析：BPM + 每个重拍的时间点（纯 numpy 实现，无 librosa）"""
import sys, wave, json
import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else 'audio/mono22050.wav'

with wave.open(SRC, 'rb') as w:
    sr = w.getframerate()
    n = w.getnframes()
    raw = w.readframes(n)
    ch = w.getnchannels()
y = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768.0
if ch > 1:
    y = y.reshape(-1, ch).mean(axis=1)

# ---------- 预加重 + 去直流 ----------
y = y - y.mean()

# ---------- STFT ----------
N_FFT = 1024
HOP = 256
win = np.hanning(N_FFT).astype(np.float32)
frames = 1 + (len(y) - N_FFT) // HOP
idx = np.arange(N_FFT)[None, :] + HOP * np.arange(frames)[:, None]
S = np.abs(np.fft.rfft(y[idx] * win, axis=1)).astype(np.float32)  # (frames, bins)
freqs = np.fft.rfftfreq(N_FFT, 1.0 / sr)
times = (np.arange(frames) * HOP + N_FFT / 2) / sr

# ---------- 谱流（onset envelope） ----------
S_db = np.log1p(S * 10.0)
flux = np.maximum(0.0, np.diff(S_db, axis=0)).sum(axis=1)
flux = np.concatenate([[0.0], flux])

# 低频（底鼓）谱流
low = freqs < 160
flux_low = np.maximum(0.0, np.diff(S_db[:, low], axis=0)).sum(axis=1)
flux_low = np.concatenate([[0.0], flux_low])

# 高频（镲/踩镲）谱流
high = freqs > 4000
flux_high = np.maximum(0.0, np.diff(S_db[:, high], axis=0)).sum(axis=1)
flux_high = np.concatenate([[0.0], flux_high])

def norm(v):
    v = v - np.median(v)
    v = np.maximum(v, 0)
    s = v.std() + 1e-9
    return v / s

env = norm(flux)
env_low = norm(flux_low)
env_high = norm(flux_high)

# ---------- 全局 BPM：梳状滤波扫描 ----------
frame_rate = sr / HOP
min_bpm, max_bpm = 60, 190
best = None
scores = []
for bpm in np.arange(min_bpm, max_bpm + 0.01, 0.25):
    period = 60.0 / bpm * frame_rate
    score = 0.0
    for mult, wgt in ((1, 1.0), (2, 0.6), (4, 0.35)):
        lag = period * mult
        if lag >= len(env) / 2:
            continue
        # 在整数 lag 附近做线性插值相关
        k = int(np.floor(lag))
        frac = lag - k
        shifted = (1 - frac) * env[:-k or None] + frac * env[1:len(env) - k + 1]
        score += wgt * float(np.dot(env[k:], shifted) / (len(shifted) + 1e-9))
    scores.append((bpm, score))
    if best is None or score > best[1]:
        best = (bpm, score)

bpm0 = float(best[0])
# 倍频/半频校正：让 BPM 落在 80~160 的常用区间
while bpm0 < 78:
    bpm0 *= 2
while bpm0 > 170:
    bpm0 /= 2

# ---------- 动态规划节拍跟踪（Ellis） ----------
period = 60.0 / bpm0 * frame_rate
tight = 5.0
N = len(env)

# 局部归一化
local = np.convolve(env, np.ones(int(round(period))) / max(1, int(round(period))), mode='same')
envn = env / (local + 1e-6)
envn = np.maximum(envn, 0)

score = np.zeros(N)
back = -np.ones(N, dtype=int)
lo = int(round(period * 0.55))
hi = int(round(period * 1.45))
lo = max(1, lo)
hi = max(lo + 1, hi)
for t in range(N):
    best_s, best_i = -1e9, -1
    for cand in range(t - hi, t - lo + 1):
        if cand < 0:
            continue
        s = score[cand] - tight * (np.log((t - cand) / period) ** 2)
        if s > best_s:
            best_s, best_i = s, cand
    score[t] = envn[t] + (best_s if best_i >= 0 else 0.0)
    back[t] = best_i

beats = []
t = int(np.argmax(score))
while t >= 0:
    beats.append(t)
    t = back[t]
beats = np.array(sorted(beats))

# 用 onset 峰值把每个拍点吸附到最近的能量峰（±60ms）
off = int(round(0.06 * frame_rate))
peaks = []
for b in beats:
    a, z = max(0, b - off), min(N, b + off + 1)
    peaks.append(a + int(np.argmax(env[a:z])))
beat_times = times[np.array(peaks)]

# 实际 BPM（用中位间隔反算）
if len(beat_times) > 4:
    iv = np.diff(beat_times)
    iv = iv[(iv > 0.2) & (iv < 2.0)]
    bpm_real = 60.0 / float(np.median(iv))
else:
    bpm_real = bpm0

# ---------- 重拍：4/4 拍相位搜索 ----------
nb = len(beat_times)
bi = np.array(peaks)
low_at_beat = env_low[np.clip(bi, 0, N - 1)]
all_at_beat = env[np.clip(bi, 0, N - 1)]

best_phase, best_val = 0, -1e9
for ph in range(4):
    sel = np.arange(ph, nb, 4)
    val = float(low_at_beat[sel].mean() * 1.0 + all_at_beat[sel].mean() * 0.5)
    if val > best_val:
        best_val, best_phase = val, ph

downbeat_idx = list(range(best_phase, nb, 4))
downbeats = [float(beat_times[i]) for i in downbeat_idx]
beat_q = [float(low_at_beat[i]) for i in range(nb)]
beat_a = [float(all_at_beat[i]) for i in range(nb)]

out = {
    'duration': float(len(y) / sr),
    'bpm': round(bpm_real, 2),
    'bpm_hint': round(bpm0, 2),
    'beat_count': nb,
    'beats': [round(float(t), 3) for t in beat_times],
    'beat_low': [round(v, 2) for v in beat_q],
    'beat_all': [round(v, 2) for v in beat_a],
    'downbeats': [round(t, 3) for t in downbeats],
    'bar': 4,
}
print(json.dumps(out))
