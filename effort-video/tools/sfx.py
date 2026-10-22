"""程序合成音效库：不依赖任何素材，全部用振荡器 + 噪声 + 包络写出来"""
import os, wave, struct
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audio', 'sfx')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20261021)


def t_arr(dur):
    return np.arange(int(SR * dur)) / SR


def env_ad(n, attack=0.004, decay=0.25, curve=3.0):
    a = max(1, int(SR * attack))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    d = np.linspace(0, 1, max(1, n - a))
    e[a:] = np.exp(-curve * d) * (1 - d) ** 0.6
    return e


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def fft_band(x, lo, hi, soft=0.35):
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    mask = np.ones_like(f)
    if lo > 0:
        mask *= np.clip((f - lo * (1 - soft)) / (lo * soft + 1e-6), 0, 1)
    if hi < SR / 2:
        mask *= np.clip((hi * (1 + soft) - f) / (hi * soft + 1e-6), 0, 1)
    return np.fft.irfft(X * mask, n)


def sweep(f0, f1, dur, curve=1.0):
    n = int(SR * dur)
    t = np.arange(n) / SR
    k = (t / dur) ** curve
    f = f0 * (f1 / f0) ** k
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase)


def norm(x, peak=0.9):
    m = np.abs(x).max()
    return x / m * peak if m > 1e-9 else x


def fade_edges(x, ms=3):
    n = max(1, int(SR * ms / 1000))
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def save(name, x, pan=0.0):
    x = norm(fade_edges(x), 0.85)
    l = x * (1 - max(0, pan) * 0.6)
    r = x * (1 + min(0, pan) * 0.6)
    st = np.stack([l, r], axis=1)
    pcm = np.clip(st * 32767, -32768, 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return name


# ---------------- 具体音效 ----------------

def slam():
    """大字砸入：低频冲击 + 噪声瞬态"""
    d = 0.55
    t = t_arr(d)
    body = sweep(150, 42, d, 0.4) * np.exp(-9 * t)
    click = fft_band(rng.standard_normal(len(t)), 1200, 7000) * np.exp(-70 * t)
    air = fft_band(rng.standard_normal(len(t)), 200, 900) * np.exp(-16 * t)
    return body * 1.0 + click * 0.35 + air * 0.28


def whoosh(dur=0.42, up=True):
    """转场风声：带通噪声扫频"""
    n = int(SR * dur)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # 分段带通，中心频率随时间上/下扫
    segs = 12
    for i in range(segs):
        a, b = int(n * i / segs), int(n * (i + 1) / segs)
        frac = i / (segs - 1)
        c = (600 + 5200 * frac) if up else (5600 - 5000 * frac)
        out[a:b] = fft_band(noise[a:b], c * 0.5, min(c * 2.0, SR / 2 - 500))[:b - a]
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.4
    return out * env


def whir(dur=0.5):
    """数字滚动：快速脉冲串"""
    n = int(SR * dur)
    x = np.zeros(n)
    step = int(SR * 0.028)
    for i in range(0, n - step, step):
        blip = fft_band(rng.standard_normal(step), 1800, 6000) * np.exp(-60 * np.arange(step) / SR)
        x[i:i + step] += blip * (0.4 + 0.6 * (i / n))
    return x


def chop():
    """木击/筷子"""
    d = 0.18
    t = t_arr(d)
    body = np.sin(2 * np.pi * 780 * t) * np.exp(-38 * t)
    body += 0.5 * np.sin(2 * np.pi * 1240 * t) * np.exp(-52 * t)
    nz = fft_band(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-90 * t)
    return body * 0.7 + nz * 0.35


def steam(dur=0.6):
    """热气：高频嘶声"""
    n = int(SR * dur)
    x = fft_band(rng.standard_normal(n), 3500, 12000)
    env = np.exp(-3.2 * np.linspace(0, 1, n)) * np.linspace(0.2, 1, n)
    return x * env


def metal():
    """天平金属：非谐分音"""
    d = 0.7
    t = t_arr(d)
    partials = [(523, 0.9), (1174, 0.55), (1889, 0.35), (2711, 0.22), (3960, 0.12)]
    x = sum(a * np.sin(2 * np.pi * f * t + i) * np.exp(-(5 + i * 2.5) * t) for i, (f, a) in enumerate(partials))
    nz = fft_band(rng.standard_normal(len(t)), 3000, 11000) * np.exp(-45 * t) * 0.2
    return x + nz


def clunk():
    """重物落盘"""
    d = 0.3
    t = t_arr(d)
    body = sweep(220, 70, d, 0.5) * np.exp(-14 * t)
    nz = fft_band(rng.standard_normal(len(t)), 800, 4000) * np.exp(-55 * t) * 0.4
    return body + nz


def pulse():
    """脑内光点：心跳式低频"""
    d = 1.2
    t = t_arr(d)
    x = np.zeros(len(t))
    for k, off in enumerate([0.0, 0.34, 0.62]):
        i = int(off * SR)
        seg = np.arange(len(t) - i) / SR
        x[i:] += np.sin(2 * np.pi * 62 * seg) * np.exp(-7 * seg) * (0.9 - k * 0.2)
    return x


def riser(dur=0.9):
    """上升扫频：光柱冲起"""
    t = t_arr(dur)
    x = sweep(180, 1800, dur, 1.7) * np.linspace(0.15, 1, len(t)) ** 1.5
    nz = fft_band(rng.standard_normal(len(t)), 900, 9000) * np.linspace(0, 0.5, len(t)) ** 2.2
    return x * 0.7 + nz


def bell(freq=880, dur=1.1):
    """金属余韵：片名"""
    t = t_arr(dur)
    parts = [(1.0, 0.8, 2.2), (2.01, 0.45, 3.1), (2.98, 0.3, 4.4), (4.21, 0.18, 6.0), (5.43, 0.1, 8.0)]
    x = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-dm * t) for m, a, dm in parts)
    return x


def tick():
    d = 0.09
    t = t_arr(d)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-110 * t) + 0.4 * fft_band(rng.standard_normal(len(t)), 4000, 12000) * np.exp(-140 * t)


def drop():
    """水滴"""
    d = 0.35
    t = t_arr(d)
    return sweep(1400, 420, d, 0.35) * np.exp(-13 * t)


def flash():
    """闪光帧：白噪 + 高频瞬态"""
    d = 0.22
    t = t_arr(d)
    return fft_band(rng.standard_normal(len(t)), 500, 14000) * np.exp(-55 * t)


if __name__ == '__main__':
    made = []
    made.append(('slam', slam(), 0.0))
    made.append(('whoosh', whoosh(0.42, True), 0.0))
    made.append(('whoosh_dn', whoosh(0.4, False), 0.0))
    made.append(('whir', whir(0.5), 0.0))
    made.append(('chop', chop(), 0.0))
    made.append(('steam', steam(0.6), 0.0))
    made.append(('metal', metal(), 0.0))
    made.append(('clunk', clunk(), 0.0))
    made.append(('pulse', pulse(), 0.0))
    made.append(('riser', riser(0.9), 0.0))
    made.append(('bell', bell(880, 1.2), 0.0))
    made.append(('bell_hi', bell(1320, 1.0), 0.0))
    made.append(('tick', tick(), 0.0))
    made.append(('drop', drop(), 0.0))
    made.append(('flash', flash(), 0.0))
    for name, sig, pan in made:
        save(name, sig, pan)
    print('sfx written:', len(made), '->', OUT)
