import type { Word } from "./types.ts";

/** contact id  */
export function mergeWords(
  words: Word[],
  another: Word[],
): Word[] {
  const obj: Record<string, string> = {};
  for (const w of words.concat(another)) {
    obj[w.url] = w.title;
  }
  return Object.entries(obj).map(([url, title]) => ({
    url,
    title,
  }));
}

export async function createReadme(words: Word[]): Promise<string> {
  const readme = await Deno.readTextFile("./README.md");
  return readme.replace(/<!-- BEGIN -->[\W\w]*<!-- END -->/, createList(words));
}

export function createList(words: Word[]): string {
  return `<!-- BEGIN -->
<!-- UpdateTime ${Date()} -->
${
    words.map((x) => `1. [${x.title}](https://s.weibo.com/${x.url})`)
      .join("\n")
  }
<!-- END -->`;
}

export function createArchive(words: Word[], date: string): string {
  return `# ${date}\n
Total ${words.length}\n
${createList(words)}
`;
}
