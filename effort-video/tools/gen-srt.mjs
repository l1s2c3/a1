import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src/timeline.ts'), 'utf8');

const FPS = 30;
const start = src.indexOf('export const CUES');
const block = src.slice(start);

const re = /\{\s*from:\s*([\d.]+),\s*to:\s*([\d.]+),([^}]*)\}/gs;
const cues = [];
let m;
while ((m = re.exec(block))) {
  const body = m[3];
  const tm = body.match(/text:\s*'([^']*)'/);
  if (!tm) continue;
  const kindM = body.match(/kind:\s*'(\w+)'/);
  cues.push({
    from: Math.round(parseFloat(m[1]) * FPS) / FPS,
    to: Math.round(parseFloat(m[2]) * FPS) / FPS,
    text: tm[1].replace(/\*\*/g, ''),
    kind: kindM ? kindM[1] : 'sub',
  });
}

const fmt = (sec) => {
  const ms = Math.round(sec * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(
    Math.floor((ms % 60000) / 1000),
  )},${p(ms % 1000, 3)}`;
};

const srt = cues
  .map((c, i) => `${i + 1}\n${fmt(c.from)} --> ${fmt(c.to)}\n${c.text}\n`)
  .join('\n');

const outDir = path.resolve(root, '..');
fs.writeFileSync(path.join(outDir, '努力辩护效应-字幕.srt'), srt, 'utf8');

const total = Math.round(cues[cues.length - 1].to);
const md = [
  '# 努力辩护效应 · 字幕稿',
  '',
  `时长 ${Math.floor(total / 60)} 分 ${total % 60} 秒 · 1920×1080 · 30fps · 16:9 · 无配音`,
  '',
  '| 时间 | 类型 | 字幕 |',
  '| --- | --- | --- |',
  ...cues.map((c) => {
    const t = c.kind === 'hero' ? '主标题' : c.kind === 'big' ? '大字幕' : '解说';
    return `| ${c.from.toFixed(1)}s – ${c.to.toFixed(1)}s | ${t} | ${c.text} |`;
  }),
  '',
].join('\n');
fs.writeFileSync(path.join(outDir, '努力辩护效应-字幕稿.md'), md, 'utf8');
console.log('cues:', cues.length, 'total:', total);
