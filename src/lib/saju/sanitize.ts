/**
 * Markdown-strip helpers for AI responses.
 *
 * The PDF/HTML renderers do not interpret markdown, so leftover `**bold**`,
 * `__bold__`, backtick code spans, or leading `#` headings appear as literal
 * characters in the output. We strip the markers but keep the underlying text.
 */

const PAIR_PATTERNS: Array<[RegExp, string]> = [
  [/\*\*([^*\n]+?)\*\*/g, "$1"],   // **bold** → bold
  [/__([^_\n]+?)__/g, "$1"],       // __bold__ → bold
  [/(?<!\w)\*([^*\n]+?)\*(?!\w)/g, "$1"], // *italic* → italic (word-boundary safe)
  [/(?<!\w)_([^_\n]+?)_(?!\w)/g, "$1"],   // _italic_ → italic
  [/`([^`\n]+?)`/g, "$1"],         // `code` → code
];

const STRIP_PATTERNS: RegExp[] = [
  /^\s{0,3}#{1,6}\s+/gm,           // leading "# ", "## ", ...
  /\*\*/g,                         // any stray ** left over
  /__/g,                           // any stray __
];

export function stripMarkdown(input: string): string {
  if (!input) return input;
  let out = input;
  for (const [pat, rep] of PAIR_PATTERNS) {
    out = out.replace(pat, rep);
  }
  for (const pat of STRIP_PATTERNS) {
    out = out.replace(pat, "");
  }
  return out;
}

/**
 * Deep-strip markdown markers from every string value inside an arbitrary
 * JSON-like structure. Returns a new value with the same shape.
 */
export function stripMarkdownDeep<T>(value: T): T {
  if (typeof value === "string") {
    return stripMarkdown(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => stripMarkdownDeep(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stripMarkdownDeep(v);
    }
    return out as unknown as T;
  }
  return value;
}

/** No-markdown instruction line to append to every AI system prompt. */
export const NO_MARKDOWN_RULE =
  "절대 마크다운(**, __, *, _, #, ``` 등)을 사용하지 마세요. 강조나 헤딩 표시 없이 순수 한국어 텍스트로만 작성하세요. 응답 JSON 형식인 경우에도 각 문자열 값 안에 마크다운 마커를 절대 넣지 마세요.";
