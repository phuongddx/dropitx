
export async function getHighlighterWithLang(lang: string) {
  const highlighter = await getHighlighter();
  return highlighter;
}
