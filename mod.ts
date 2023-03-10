#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
// Copyright 2023 Seiri. All rights reserved. MIT license.
import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";
import { exists } from "std/fs/mod.ts";
import type { Word } from "./types.ts";
import { createArchive, createReadme, mergeWords } from "./utils.ts";

const regexp = /<a href="(\/weibo\?q=[^"]+)".*?>(.+)<\/a>/g;
// weibo
const response = await fetch("https://s.weibo.com/top/summary", {
  headers: {
    "Cookie":
      "SUB=_2AkMWJrkXf8NxqwJRmP8SxWjnaY12zwnEieKgekjMJRMxHRl-yj9jqmtbtRB6PaaX-IGp-AjmO6k5cS-OH2X9CayaTzVD",
  },
});

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}
//search top weibo result
const result: string = await response.text();
// content match result
const matches = result.matchAll(regexp);
// article data {url: url, title:title }
const words: Word[] = Array.from(matches).map((x) => ({
  url: x[1],
  title: x[2],
}));
// date format
const yyyyMMdd = format(new Date(), "yyyy-MM-dd");
// json path
const fullPath = join("raw", `${yyyyMMdd}.json`);
//origin data
let wordsAlreadyDownload: Word[] = [];
if (await exists(fullPath)) {
  const content = await Deno.readTextFile(fullPath);
  wordsAlreadyDownload = JSON.parse(content);
}
// save origin data
const queswordsAll = mergeWords(words, wordsAlreadyDownload);
await Deno.writeTextFile(fullPath, JSON.stringify(queswordsAll));
// update README.md
const readme = await createReadme(queswordsAll);
await Deno.writeTextFile("./README.md", readme);
// update archives
const archiveText = createArchive(queswordsAll, yyyyMMdd);
const archivePath = join("archives", `${yyyyMMdd}.md`);
await Deno.writeTextFile(archivePath, archiveText);
