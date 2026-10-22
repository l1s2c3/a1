"""终混：旁白（按 timeline 落点）+ BGM（旁白自动闪避）+ SFX → audio/mix.wav。

旁白解码：ffmpeg 将 edge-tts 的 mp3 转成 44.1k 单声道 float32 raw。
响度策略：旁白 1.0 / BGM 0.9（已含闪避）/ SFX 0.8，峰值归一到 -1dBFS。
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100


def decode_mp3(path: Path) -> np.ndarray:
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ar", str(SR), "-ac", "1",
         "-f", "f32le", "-"],
        capture_output=True, timeout=60)
    if out.returncode != 0:
        raise RuntimeError(f"解码失败 {path}: {out.stderr[-200:]!r}")
    return np.frombuffer(out.stdout, dtype="<f4").astype(np.float64)


def read_wav(path: Path) -> np.ndarray:
    import wave
    with wave.open(str(path), "rb") as w:
        n, ch, sw, sr = w.getnframes(), w.getnchannels(), w.getsampwidth(), w.getframerate()
        raw = w.readframes(n)
    assert sr == SR and sw == 2, f"unexpected wav fmt {sr}/{sw}"
    data = np.frombuffer(raw, dtype="<i2").reshape(-1, ch).astype(np.float64) / 32768
    return data.mean(axis=1)


def write_wav(path: Path, data: np.ndarray) -> None:
    import wave
    pcm = (np.clip(data, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.column_stack([pcm, pcm]).tobytes())


def duck_envelope(total: float, narration: list[dict], depth: float = 0.55) -> np.ndarray:
    """旁白活跃时段将 BGM 压低 depth；200ms 平滑过渡。"""
    n = int(total * SR)
    active = np.zeros(n)
    for ln in narration:
        i0 = max(0, int((ln["start"] - 0.15) * SR))
        i1 = min(n, int((ln["end"] + 0.4) * SR))
        active[i0:i1] = 1.0
    win = int(0.2 * SR)
    kernel = np.ones(win) / win
    smooth = np.convolve(active, kernel, mode="same")
    return 1.0 - depth * smooth


def main() -> None:
    tl = json.loads((ROOT / "timeline.json").read_text(encoding="utf-8"))
    total = tl["duration"]
    n = int(total * SR)

    # 1. 旁白轨
    voice = np.zeros(n)
    for ln in tl["narration"]:
        seg = decode_mp3(ROOT / "audio" / "lines" / f"{ln['id']}.mp3")
        i0 = int(ln["start"] * SR)
        i1 = min(i0 + len(seg), n)
        voice[i0:i1] += seg[: i1 - i0]
    print(f"voice peak={np.abs(voice).max():.2f}")

    # 2. BGM + 闪避
    bgm = read_wav(ROOT / "audio" / "bgm.wav")[:n]
    if len(bgm) < n:
        bgm = np.pad(bgm, (0, n - len(bgm)))
    bgm = bgm * duck_envelope(total, tl["narration"])

    # 3. SFX
    sfx = read_wav(ROOT / "audio" / "sfx.wav")[:n]
    if len(sfx) < n:
        sfx = np.pad(sfx, (0, n - len(sfx)))

    # 4. 总线
    mix = voice * 1.0 + bgm * 0.9 + sfx * 0.8
    peak = np.abs(mix).max()
    target = 10 ** (-1 / 20)  # -1dBFS
    if peak > 0:
        mix *= min(1.0, target / peak) * 0.98
    print(f"mix peak before norm={peak:.2f}, after={np.abs(mix).max():.2f}")

    write_wav(ROOT / "audio" / "voice.wav", voice)
    write_wav(ROOT / "audio" / "mix.wav", mix)
    print(f"已写出 audio/voice.wav 与 audio/mix.wav（{total:.2f}s）")


if __name__ == "__main__":
    main()
