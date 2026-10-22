/**
 * 从 src/fast/shots.ts 的 CUES 生成 SRT（快版唯一时间真源）
 * 用法：node tools/gen-srt-fast.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/fast/shots.ts'), 'utf8');

// 与 beats.ts 保持同一套数字：112.85 BPM，首拍 0.054s
const BPM = 112.85;
const BEAT = 60 / BPM;
const T0 = 0.054;
const beatTime = (b) => T0 + b * BEAT;

const block = src.slice(src.indexOf('export const CUES'));
const re = /\{b0:\s*([\d.]+),\s*b1:\s*([\d.]+),\s*text:\s*'([^']*)'/g;
const cues = [];
let m;
while ((m = re.exec(block))) {
  cues.push({b0: +m[1], b1: +m[2], text: m[3].replace(/\*\*/g, '')});
}

const fmt = (sec) => {
  const ms = Math.round(sec * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(
    Math.floor((ms % 60000) / 1000),
  )},${p(ms % 1000, 3)}`;
};

const srt = cues
  .map((c, i) => `${i + 1}\n${fmt(beatTime(c.b0))} --> ${fmt(beatTime(c.b1))}\n${c.text}\n`)
  .join('\n');

const out = path.resolve(root, '..', '努力辩护效应-字幕-fast.srt');
fs.writeFileSync(out, srt, 'utf8');
console.log(`写出 ${out}，共 ${cues.length} 条`);
cues.forEach((c, i) => console.log(`${i + 1}. ${beatTime(c.b0).toFixed(2)}–${beatTime(c.b1).toFixed(2)}  ${c.text}`));
