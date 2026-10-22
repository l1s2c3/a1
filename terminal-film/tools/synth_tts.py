"""逐行 TTS 合成 + 时长测量（改编自 math-concept-film 的 tts_lines.py）。

只合成、不拼接：每行一个 mp3，时长写入 durations.json，
由 build_timeline.py 决定每行在成片时间轴上的落点。
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except AttributeError:
    pass


def measure(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, timeout=15, encoding="utf-8",
    )
    if out.returncode != 0 or not out.stdout.strip():
        raise RuntimeError(f"ffprobe 失败: {path} {out.stderr[-200:]}")
    return float(out.stdout.strip())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("lines")
    ap.add_argument("--voice", default="zh-CN-YunyangNeural")
    ap.add_argument("--rate", default="+15%")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    import edge_tts

    root = Path(args.lines).parent
    lines = json.loads(Path(args.lines).read_text(encoding="utf-8"))
    out_dir = root / "audio" / "lines"
    out_dir.mkdir(parents=True, exist_ok=True)

    durations = {}
    for line in lines:
        lid, text = line["id"], line["text"]
        seg = out_dir / f"{lid}.mp3"
        if args.force or not seg.exists():
            print(f"  [{lid}] {text}")
            edge_tts.Communicate(text, args.voice, rate=args.rate).save_sync(str(seg))
            time.sleep(0.35)
        durations[lid] = round(measure(seg), 3)
        print(f"      -> {durations[lid]:.2f}s")

    (root / "audio" / "durations.json").write_text(
        json.dumps({"voice": args.voice, "rate": args.rate,
                    "durations": durations}, ensure_ascii=False, indent=2),
        encoding="utf-8")
    print(f"完成，时长表 -> {root / 'audio' / 'durations.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
