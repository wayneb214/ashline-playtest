#!/usr/bin/env node
/* Copy a standalone Albion House web bundle into www/.
   The bundle is the game under ../spy only. It does not include the root
   Ashline game, spy/review, docs, or image/video files the game never requests. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, "..");
export const spyRoot = path.resolve(root, "../spy");
export const wwwRoot = path.join(root, "www");

const ENDINGS = ["win", "mixed", "loss", "traded"];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

export function readSources(dir = spyRoot) {
  return walk(dir)
    .filter((p) => /\.(js|css|html)$/.test(p) && !p.includes(`${path.sep}review${path.sep}`))
    .map((p) => fs.readFileSync(p, "utf8"))
    .join("\n");
}

export function requiredMedia(source) {
  const need = new Set();
  const add = (rel) => {
    const file = path.join(spyRoot, rel);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) need.add(rel.split(path.sep).join("/"));
  };
  for (const m of source.matchAll(/(?:img|audio|fonts)\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp|mp4|webm|mp3|woff2|svg)/g)) add(m[0]);
  for (const m of source.matchAll(/["']([A-Za-z0-9_-]+)["']/g)) {
    add(`img/${m[1]}.jpg`);
    add(`img/h-${m[1]}.jpg`);
  }
  const cineIds = new Set(ENDINGS.map((e) => `end-${e}`));
  // img: "bath" and img: ok ? "end2-good" : "end2-bad" both count. A bare quoted word does not.
  for (const m of source.matchAll(/\bimg:\s*([^,\n}]{0,80})/g)) {
    for (const id of m[1].matchAll(/["']([A-Za-z0-9_-]+)["']/g)) cineIds.add(id[1]);
  }
  for (const m of source.matchAll(/\binset:\s*["']([A-Za-z0-9_-]+)["']/g)) add(`img/${m[1]}.jpg`);
  const moveBlock = source.match(/const MOVE = \{([^}]+)\}/);
  const moveIds = new Set();
  if (moveBlock) {
    for (const m of moveBlock[1].matchAll(/["']?([A-Za-z0-9_-]+)["']?\s*:/g)) moveIds.add(m[1]);
  }
  for (const id of cineIds) {
    add(`img/cine/${id}-0.jpg`);
    add(`img/cine/${id}-1.webp`);
    add(`img/cine/${id}-2.webp`);
    if (moveIds.has(id)) {
      add(`img/cine/video/${id}.mp4`);
      add(`img/cine/video/${id}.webm`);
    }
  }
  for (const m of source.matchAll(/\bui:\s*["']([A-Za-z0-9_-]+)["']/g)) add(`img/cine/tr-${m[1]}.jpg`);
  // voice.js builds audio/voice/<id>.mp3, including ids assembled from officer + beat.
  // Every clip in that folder is one of those lines.
  if (source.includes("audio/voice/")) {
    for (const file of walk(path.join(spyRoot, "audio", "voice"))) {
      need.add(path.relative(spyRoot, file).split(path.sep).join("/"));
    }
  }
  for (const file of walk(path.join(spyRoot, "fonts"))) {
    const rel = path.relative(spyRoot, file).split(path.sep).join("/");
    if (/\.(woff2|txt)$/.test(rel)) need.add(rel);
  }
  return need;
}

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

export function packageWeb() {
  if (!fs.existsSync(path.join(spyRoot, "index.html"))) throw new Error("spy/index.html is missing");
  fs.rmSync(wwwRoot, { recursive: true, force: true });
  fs.mkdirSync(wwwRoot, { recursive: true });
  const source = readSources();
  const media = requiredMedia(source);
  for (const name of fs.readdirSync(spyRoot)) {
    const from = path.join(spyRoot, name);
    if (!fs.statSync(from).isFile()) continue;
    if (/\.(js|css|html|webmanifest|svg|png)$/.test(name)) copyFile(from, path.join(wwwRoot, name));
  }
  for (const rel of media) copyFile(path.join(spyRoot, rel), path.join(wwwRoot, rel));
  const packed = walk(wwwRoot).map((p) => path.relative(wwwRoot, p).split(path.sep).join("/")).sort();
  const excluded = walk(path.join(spyRoot, "img"))
    .map((p) => path.relative(spyRoot, p).split(path.sep).join("/"))
    .filter((rel) => !media.has(rel))
    .sort();
  return { packed, excluded };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { packed, excluded } = packageWeb();
  console.log(`Packaged ${packed.length} files into ${wwwRoot}`);
  if (excluded.length) console.log("Left out unused images:\n" + excluded.map((f) => "  " + f).join("\n"));
}
