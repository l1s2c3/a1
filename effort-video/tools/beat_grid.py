"""精细节拍网格：给定时间窗口，输出恒定 BPM 网格 + 强拍，并画校验图"""
import sys, json, wave
import numpy as np

SRC = 'audio/mono22050.wav'
T0 = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
T1 = float(sys.argv[2]) if len(sys.argv) > 2 else 12.0
OUTPNG = sys.argv[3] if len(sys.argv) > 3 else 'audio/grid.png'
OUTJSON = sys.argv[4] if len(sys.argv) > 4 else 'audio/grid.json'

with wave.open(SRC, 'rb') as w:
    sr = w.getframerate()
    y = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768.0

a, b = int(T0 * sr), int(min(len(y), T1 * sr))
seg = y[a:b]

N_FFT, HOP = 1024, 128
win = np.hanning(N_FFT).astype(np.float32)
frames = 1 + (len(seg) - N_FFT) // HOP
idx = np.arange(N_FFT)[None, :] + HOP * np.arange(frames)[:, None]
S = np.abs(np.fft.rfft(seg[idx] * win, axis=1)).astype(np.float32)
freqs = np.fft.rfftfreq(N_FFT, 1.0 / sr)
tloc = (np.arange(frames) * HOP + N_FFT / 2) / sr + T0

Sdb = np.log1p(S * 10.0)
flux = np.maximum(0.0, np.diff(Sdb, axis=0)).sum(axis=1)
flux = np.concatenate([[0.0], flux])
lowb = freqs < 160
flux_low = np.concatenate([[0.0], np.maximum(0.0, np.diff(Sdb[:, lowb], axis=0)).sum(axis=1)])

def z(v):
    v = np.maximum(v - np.median(v), 0)
    return v / (v.std() + 1e-9)

env, env_low = z(flux), z(flux_low)
frate = sr / HOP

# 精细 BPM 搜索
best = (0.0, -1e18)
for bpm in np.arange(90.0, 150.0, 0.05):
    period = 60.0 / bpm * frate
    sc = 0.0
    for mult, wgt in ((1, 1.0), (2, 0.5), (4, 0.3)):
        lag = period * mult
        k = int(round(lag))
        if k < 1 or k >= len(env):
            continue
        sc += wgt * float(np.dot(env[k:], env[:-k]) / (len(env) - k))
    if sc > best[1]:
        best = (bpm, sc)
bpm = best[0]
period = 60.0 / bpm

# 相位搜索：让拍点落在能量峰上
best_ph, best_val = 0.0, -1e18
for ph in np.arange(0, period, 0.002):
    tg = T0 + ph + period * np.arange(int((T1 - T0) / period) + 1)
    tg = tg[tg < T1]
    j = np.clip(((tg - T0) * frate).astype(int), 0, len(env) - 1)
    val = float(env[j].sum() + 0.6 * env_low[j].sum())
    if val > best_val:
        best_val, best_ph = val, ph

beats = T0 + best_ph + period * np.arange(int((T1 - T0) / period) + 1)
beats = beats[beats < T1 - 1e-6]

# 强拍：4 拍一循环，选低频能量和最大的相位
def at(t):
    j = np.clip(((t - T0) * frate).astype(int), 0, len(env) - 1)
    return env[j], env_low[j]

b_all = np.array([at(t)[0] for t in beats])
b_low = np.array([at(t)[1] for t in beats])
best_ph4, best_v4 = 0, -1e18
for ph in range(4):
    sel = np.arange(ph, len(beats), 4)
    if len(sel) == 0:
        continue
    v = float(b_low[sel].mean() + 0.5 * b_all[sel].mean())
    if v > best_v4:
        best_v4, best_ph4 = v, ph

down_idx = list(range(best_ph4, len(beats), 4))

out = {
    'window': [T0, T1],
    'bpm': round(float(bpm), 2),
    'period': round(float(period), 4),
    'beats': [round(float(t), 3) for t in beats],
    'downbeat_phase': best_ph4,
    'downbeats': [round(float(beats[i]), 3) for i in down_idx],
    'beat_env': [round(float(v), 2) for v in b_all],
    'beat_low': [round(float(v), 2) for v in b_low],
}
json.dump(out, open(OUTJSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({k: out[k] for k in ('bpm', 'period', 'downbeat_phase')}, ensure_ascii=False))
print('beats:', [round(float(t), 2) for t in beats[:24]])
print('downbeats:', [round(float(t), 2) for t in out['downbeats']])

# ---- 画校验图：自己画波形 + 拍点，纯 python 写 PNG ----
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pngwrite import write_png

W, H = 1920, 420
img = np.full((H, W, 3), 14, dtype=np.uint8)
mono = seg
step = max(1, len(mono) // W)
peak = np.array([np.abs(mono[i * step:(i + 1) * step]).max() for i in range(W)], dtype=np.float32)
peak /= (peak.max() + 1e-9)
for x in range(W):
    hh = int(peak[x] * (H * 0.45))
    if hh > 0:
        img[H // 2 - hh:H // 2 + hh, x] = (150, 165, 190)

for i, t in enumerate(beats):
    x = int((t - T0) / (T1 - T0) * (W - 1))
    if not (0 <= x < W):
        continue
    if i in down_idx:
        img[:, max(0, x - 1):min(W, x + 3)] = (255, 200, 100)
    else:
        img[:, x:x + 1] = (76, 124, 168)

n = write_png(OUTPNG, img)
print('png ok', n, 'bytes')
