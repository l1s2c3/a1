"""主时间轴生成器 —— 全片唯一时间真源。

读取 lines.json（意图 + 期望 cue）与 audio/durations.json（真实音频时长），
输出：
  timeline.json          渲染器与混音器共用的主时间轴（分段边界 / 旁白 / 音效 cue）
  captions/aligned.json  字幕时间轴

规则：每行旁白实际落点 = max(期望 cue, 上一行结束 + 0.25s)，
确保永不重叠；分段边界按 15/30/45s 锚定，SEG004 结尾按最后一句旁白顺延。
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30

# ---- 分段锚点（秒）----
SEG_BOUNDARIES = [0.0, 15.0, 30.0, 45.0]
SEG_NAMES = ["SEG001", "SEG002", "SEG003", "SEG004"]
OUTRO_HOLD = 1.6  # 落版文字定格后再淡出的时间


def srt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> None:
    lines = json.loads((ROOT / "lines.json").read_text(encoding="utf-8"))
    durations = json.loads((ROOT / "audio" / "durations.json").read_text(encoding="utf-8"))["durations"]

    # ---- 解析旁白实际落点 ----
    narration = []
    last_end = 0.0
    for line in lines:
        cue = max(line["cue"], last_end + 0.25)
        dur = durations[line["id"]]
        narration.append({
            "id": line["id"], "chapter": line["chapter"], "text": line["text"],
            "start": round(cue, 3), "end": round(cue + dur, 3),
            "duration": dur,
        })
        last_end = cue + dur

    # ---- 分段边界 ----
    n = {line["id"]: line for line in narration}
    seg_starts = dict(zip(SEG_NAMES, SEG_BOUNDARIES))
    seg1_end = max(15.0, n["v4"]["end"] + 1.2)
    seg2_end = max(30.0, seg1_end + 15.0, n["v8"]["end"] + 0.5)
    seg3_end = max(seg2_end + 15.0, n["v11"]["end"] + 1.5)
    seg4_end = n["v13"]["end"] + OUTRO_HOLD
    segments = [
        {"id": "SEG001", "start": 0.0, "end": round(seg1_end, 3)},
        {"id": "SEG002", "start": round(seg1_end, 3), "end": round(seg2_end, 3)},
        {"id": "SEG003", "start": round(seg2_end, 3), "end": round(seg3_end, 3)},
        {"id": "SEG004", "start": round(seg3_end, 3), "end": round(seg4_end, 3)},
    ]
    total = round(seg4_end + 0.6, 3)  # 淡出收尾余量

    # ---- 音效 cue（绝对秒；与分镜描述一一对应）----
    sfx = [
        # SEG001
        {"name": "hum",            "start": 0.0,                     "duration": segments[0]["end"]},
        {"name": "typing",         "start": n["v2"]["start"],        "duration": min(3.2, n["v2"]["duration"] + 0.2), "style": "slow"},
        {"name": "whoosh",         "start": n["v3"]["start"],        "duration": 0.9},
        {"name": "ping",           "start": n["v3"]["start"] + 1.6,  "duration": 0.5},
        {"name": "riser",          "start": n["v4"]["start"],        "duration": 1.7, "to": 1400},
        {"name": "level_ticks",    "start": n["v4"]["start"] + 0.3,  "duration": 1.4, "count": 5},
        {"name": "flash",          "start": segments[0]["end"] - 0.8, "duration": 0.8},
        # SEG002
        {"name": "zap",            "start": segments[1]["start"],    "duration": 0.6},
        {"name": "pulse",          "start": segments[1]["start"],    "duration": n["v8"]["end"] - segments[1]["start"], "period": 1.5},
        {"name": "alarm",          "start": n["v6"]["start"] + 0.15, "duration": 1.1},
        {"name": "glitch",         "start": n["v6"]["start"],        "duration": 2.2},
        {"name": "typing",         "start": n["v7"]["start"],        "duration": min(2.6, n["v7"]["duration"] + 0.2), "style": "fast"},
        {"name": "confirm",        "start": n["v8"]["end"] - 0.2,    "duration": 0.8},
        # SEG003
        {"name": "typing",         "start": n["v9"]["start"],        "duration": min(2.4, n["v9"]["duration"] + 0.2), "style": "slow"},
        {"name": "chime_soft",     "start": n["v10"]["start"] + 0.3, "duration": 0.6},
        {"name": "alert",          "start": n["v10"]["start"] + 1.1, "duration": 1.2},
        {"name": "bar_rise",       "start": n["v11"]["start"],       "duration": 1.6, "to": 500},
        {"name": "bar_rise",       "start": n["v11"]["start"] + 0.25,"duration": 1.7, "to": 1500},
        {"name": "bgm_lift",       "start": n["v11"]["start"] + 1.9, "duration": 0.7},
        # SEG004
        {"name": "typing",         "start": n["v12"]["start"],       "duration": min(2.0, n["v12"]["duration"]), "style": "red"},
        {"name": "blip2",          "start": n["v12"]["end"] + 0.5,   "duration": 0.8},
        {"name": "end_tone",       "start": n["v13"]["start"],       "duration": total - n["v13"]["start"]},
    ]

    timeline = {
        "fps": FPS, "width": 1080, "height": 1920,
        "duration": total, "total_frames": int(round(total * FPS)),
        "segments": segments, "narration": narration, "sfx": sfx,
        "theme": {
            "bg": "#000000", "primary": "#00FF9C", "dim": "#9AA5A1",
            "muted": "#3A4442", "red": "#FF3B4E", "amber": "#FFB020",
        },
    }
    (ROOT / "timeline.json").write_text(
        json.dumps(timeline, ensure_ascii=False, indent=2), encoding="utf-8")

    # ---- 字幕 ----
    aligned = {
        "fps": FPS, "total_duration": total,
        "lines": [{**ln, "start_frame": int(round(ln["start"] * FPS)),
                   "end_frame": int(round(ln["end"] * FPS))} for ln in narration],
    }
    cap_dir = ROOT / "captions"
    cap_dir.mkdir(exist_ok=True)
    (cap_dir / "aligned.json").write_text(
        json.dumps(aligned, ensure_ascii=False, indent=2), encoding="utf-8")
    srt = "\n".join(
        f"{i}\n{srt_time(l['start'])} --> {srt_time(l['end'])}\n{l['text']}\n"
        for i, l in enumerate(narration, 1))
    (cap_dir / "captions.srt").write_text(srt, encoding="utf-8")

    print(f"总时长 {total:.2f}s（{int(round(total * FPS))} 帧）")
    for seg in segments:
        print(f"  {seg['id']}: {seg['start']:6.2f} - {seg['end']:6.2f}")
    places = ", ".join("{}@{:.1f}".format(l["id"], l["start"]) for l in narration)
    print("旁白落点: " + places)
    print("timeline.json / captions 已生成")

    # 同步进 Remotion 工程（渲染器从这里 import）
    remotion_src = ROOT / "remotion" / "src"
    remotion_src.mkdir(parents=True, exist_ok=True)
    (remotion_src / "timeline.json").write_text(
        json.dumps(timeline, ensure_ascii=False, indent=2), encoding="utf-8")
    print("已同步 -> remotion/src/timeline.json")


if __name__ == "__main__":
    main()
