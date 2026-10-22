"""程序化音效合成 —— 按 timeline.json 的 cue 生成整段 SFX 轨 + BGM 轨。

哲学：全部用numpy手写振荡器/噪声/包络，无任何素材文件。
输出：
  audio/sfx.wav   所有音效按绝对秒落位（卡点）
  audio/bgm.wav   暗色环境电子垫（长持续，混音阶段做旁白闪避）
"""
from __future__ import annotations

import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
RNG = np.random.default_rng(20261021)


# ---------- 基础工具 ----------
def t_array(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def sine(freq: float, dur: float, phase: float = 0.0) -> np.ndarray:
    return np.sin(2 * np.pi * freq * t_array(dur) + phase)


def sweep(f0: float, f1: float, dur: float, curve: float = 1.0) -> np.ndarray:
    t = t_array(dur)
    k = (f1 / f0) ** (1 / dur)
    freq = f0 * k ** (t * curve)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def noise(dur: float) -> np.ndarray:
    return RNG.standard_normal(int(dur * SR))


def lowpass(x: np.ndarray, fc: float) -> np.ndarray:
    rc = 1.0 / (2 * np.pi * fc)
    dt = 1.0 / SR
    a = dt / (rc + dt)
    y = np.empty_like(x)
    acc = x[0]
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x: np.ndarray, fc: float) -> np.ndarray:
    return x - lowpass(x, fc)


def env_adsr(n: int, a: float, r: float, sustain: float = 1.0) -> np.ndarray:
    """a/r 为秒；段间线性，无 sustain 保持段（用于 one-shot）。"""
    e = np.ones(n) * sustain
    na, nr = int(a * SR), int(r * SR)
    na = min(na, n)
    nr = min(nr, n)
    if na > 0:
        e[:na] = np.linspace(0, 1, na)
    if nr > 0:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def place(buf: np.ndarray, sig: np.ndarray, start: float, gain: float = 1.0) -> None:
    i0 = int(start * SR)
    i1 = min(i0 + len(sig), len(buf))
    if i1 > i0:
        buf[i0:i1] += sig[: i1 - i0] * gain


def write_wav(path: Path, data: np.ndarray) -> None:
    data = np.clip(data, -1.0, 1.0)
    pcm = (data * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.column_stack([pcm, pcm]).tobytes())


def stereo(data: np.ndarray) -> np.ndarray:
    return np.column_stack([data, data])


# ---------- 具体音效 ----------
def x_hum(dur: float) -> np.ndarray:
    t = t_array(dur)
    lfo = 0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * t)
    bed = lowpass(noise(dur), 300) * 0.35
    sig = (0.6 * sine(50, dur) + 0.35 * sine(100, dur) + bed) * lfo
    return sig * env_adsr(len(sig), 1.2, 1.5)


def x_typing(dur: float, style: str) -> np.ndarray:
    sig = np.zeros(int(dur * SR))
    if style == "fast":
        lo, hi, base = 0.07, 0.12, 1500
    elif style == "red":
        lo, hi, base = 0.12, 0.2, 1100
    else:
        lo, hi, base = 0.15, 0.26, 1800
    tpos = RNG.uniform(0.02, 0.08)
    while tpos < dur - 0.05:
        click = (noise(0.03) * 0.7 + sine(RNG.uniform(base * 0.9, base * 1.1), 0.03)) \
            * env_adsr(int(0.03 * SR), 0.002, 0.026)
        place(sig, click, tpos, 0.5)
        tpos += RNG.uniform(lo, hi)
    return sig


def x_whoosh(dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    fc = 400 + 4200 * np.sin(np.pi * t) ** 2
    sig = np.zeros(n)
    src = noise(dur)
    # 分段低通近似扫频
    seg = SR // 20
    for i in range(0, n, seg):
        j = min(i + seg, n)
        sig[i:j] = lowpass(src[i:j], float(fc[(i + j) // 2]))
    return sig * np.sin(np.pi * t) ** 1.5 * 0.9


def x_ping(dur: float) -> np.ndarray:
    t = t_array(dur)
    sig = sine(1200, dur) + 0.4 * sine(1800, dur)
    return sig * np.exp(-t * 7)


def x_riser(dur: float, f1: float) -> np.ndarray:
    t = t_array(dur)
    sig = sweep(180, f1, dur) + 0.35 * sweep(360, f1 * 2, dur)
    e = np.minimum(1, t / dur * 1.6) ** 1.4
    return sig * e * 0.8


def x_level_ticks(dur: float, count: int) -> np.ndarray:
    sig = np.zeros(int(dur * SR))
    for i in range(count):
        f = 800 * (1 + i * 0.22)
        tick = sine(f, 0.06) * env_adsr(int(0.06 * SR), 0.004, 0.05)
        place(sig, tick, dur * (i + 0.5) / count, 0.8)
    return sig


def x_flash(dur: float) -> np.ndarray:
    t = t_array(dur)
    sig = noise(dur) * (t / dur) ** 2.2 + 0.3 * sine(2400, dur)
    return sig * env_adsr(len(sig), 0.03, 0.05)


def x_zap(dur: float) -> np.ndarray:
    return sweep(3000, 200, dur) * env_adsr(int(dur * SR), 0.004, dur * 0.7)


def x_pulse(dur: float, period: float) -> np.ndarray:
    sig = np.zeros(int(dur * SR))
    tpos = 0.0
    while tpos < dur - 0.15:
        thump = sine(58, 0.14) * env_adsr(int(0.14 * SR), 0.005, 0.12)
        place(sig, thump, tpos, 0.9)
        tpos += period
    return sig


def x_alarm(dur: float) -> np.ndarray:
    sig = np.zeros(int(dur * SR))
    for i, f in enumerate([880, 880]):
        beep = np.sign(sine(f, 0.14)) * env_adsr(int(0.14 * SR), 0.008, 0.11)
        place(sig, lowpass(beep, 2400), 0.1 + i * 0.45, 0.5)
    return sig


def x_glitch(dur: float) -> np.ndarray:
    sig = np.zeros(int(dur * SR))
    tpos = 0.05
    while tpos < dur - 0.08:
        n = RNG.uniform(0.02, 0.06)
        burst = noise(n) * RNG.choice([1, -1]) * np.sin(2 * np.pi * RNG.uniform(200, 2000) * t_array(n))
        place(sig, burst, tpos, 0.55)
        tpos += RNG.uniform(0.12, 0.4)
    return sig


def x_confirm(dur: float) -> np.ndarray:
    sig = np.zeros(int(dur * SR))
    for i, f in enumerate([660, 990]):
        tone = sine(f, dur * 0.55) * env_adsr(int(dur * 0.55 * SR), 0.008, dur * 0.5)
        place(sig, tone, i * 0.12, 0.7)
    return sig


def x_chime_soft(dur: float) -> np.ndarray:
    t = t_array(dur)
    return (sine(880, dur) + 0.3 * sine(1320, dur)) * np.exp(-t * 5) * 0.8


def x_alert(dur: float) -> np.ndarray:
    sig = np.zeros(int(dur * SR))
    for i in range(2):
        beep = np.sign(sine(980, 0.09)) * env_adsr(int(0.09 * SR), 0.006, 0.07)
        place(sig, lowpass(beep, 3200), 0.08 + i * 0.5, 0.42)
    return sig


def x_bar_rise(dur: float, f1: float) -> np.ndarray:
    # 阶梯上升：量化到 8 级，更有"进度条"感
    steps = 8
    sig = np.zeros(int(dur * SR))
    freqs = np.linspace(200, f1, steps + 1)[1:]
    for i, f in enumerate(freqs):
        part = sine(f, dur / steps) * env_adsr(int(dur / steps * SR), 0.01, dur / steps * 0.85)
        place(sig, part, i * dur / steps, 0.75)
    tick = sine(freqs[-1] * 1.5, 0.08) * env_adsr(int(0.08 * SR), 0.005, 0.07)
    place(sig, tick, dur - 0.1, 0.8)
    return sig


def x_bgm_lift(dur: float) -> np.ndarray:
    return sweep(500, 1000, dur) * env_adsr(int(dur * SR), 0.01, dur * 0.6)


def x_blip2(dur: float) -> np.ndarray:
    sig = np.zeros(int(dur * SR))
    for i, f in enumerate([720, 960]):
        blip = sine(f, 0.1) * env_adsr(int(0.1 * SR), 0.006, 0.085)
        place(sig, blip, 0.08 + i * 0.35, 0.6)
    return sig


def x_end_tone(dur: float) -> np.ndarray:
    t = t_array(dur)
    sig = sine(65, dur) + 0.4 * sine(130, dur) + 0.2 * lowpass(noise(dur), 200)
    e = np.minimum(1, t / 0.4) * np.exp(-np.maximum(0, t - 0.6) * 0.5)
    return sig * e * 0.9


GENS = {
    "hum": lambda d, kw: x_hum(d),
    "typing": lambda d, kw: x_typing(d, kw.get("style", "slow")),
    "whoosh": lambda d, kw: x_whoosh(d),
    "ping": lambda d, kw: x_ping(d),
    "riser": lambda d, kw: x_riser(d, kw.get("to", 1400)),
    "level_ticks": lambda d, kw: x_level_ticks(d, kw.get("count", 5)),
    "flash": lambda d, kw: x_flash(d),
    "zap": lambda d, kw: x_zap(d),
    "pulse": lambda d, kw: x_pulse(d, kw.get("period", 1.5)),
    "alarm": lambda d, kw: x_alarm(d),
    "glitch": lambda d, kw: x_glitch(d),
    "confirm": lambda d, kw: x_confirm(d),
    "chime_soft": lambda d, kw: x_chime_soft(d),
    "alert": lambda d, kw: x_alert(d),
    "bar_rise": lambda d, kw: x_bar_rise(d, kw.get("to", 1000)),
    "bgm_lift": lambda d, kw: x_bgm_lift(d),
    "blip2": lambda d, kw: x_blip2(d),
    "end_tone": lambda d, kw: x_end_tone(d),
}

GAINS = {
    "hum": 0.05, "typing": 0.16, "whoosh": 0.20, "ping": 0.15, "riser": 0.16,
    "level_ticks": 0.13, "flash": 0.24, "zap": 0.20, "pulse": 0.12, "alarm": 0.17,
    "glitch": 0.13, "confirm": 0.16, "chime_soft": 0.12, "alert": 0.15,
    "bar_rise": 0.15, "bgm_lift": 0.12, "blip2": 0.14, "end_tone": 0.13,
}


def build_sfx(total: float, cues: list[dict]) -> np.ndarray:
    buf = np.zeros(int(total * SR))
    for cue in cues:
        sig = GENS[cue["name"]](cue["duration"], cue)
        place(buf, sig, cue["start"], GAINS.get(cue["name"], 0.15))
    return buf


def build_bgm(total: float) -> np.ndarray:
    t = t_array(total)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * t / 8.0)
    drone = (0.55 * sine(55, total) + 0.3 * sine(82.41, total)
             + 0.22 * sine(110, total) + 0.3 * lowpass(noise(total), 240))
    sig = drone * lfo
    # 尾奏淡出
    fade = min(3.0, total / 4)
    sig[-int(fade * SR):] *= np.linspace(1, 0, int(fade * SR))
    return sig * 0.09 / 0.09 * 0.085  # 基准响度 0.085


def main() -> None:
    tl = json.loads((ROOT / "timeline.json").read_text(encoding="utf-8"))
    total = tl["duration"]
    print(f"SFX 轨：{len(tl['sfx'])} 个 cue，总长 {total:.2f}s")
    sfx = build_sfx(total, tl["sfx"])
    bgm = build_bgm(total)
    write_wav(ROOT / "audio" / "sfx.wav", stereo(sfx))
    write_wav(ROOT / "audio" / "bgm.wav", stereo(bgm))
    print(f"peak sfx={np.abs(sfx).max():.2f} bgm={np.abs(bgm).max():.2f}")
    print("已写出 audio/sfx.wav 与 audio/bgm.wav")


if __name__ == "__main__":
    main()
