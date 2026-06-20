// Client-safe helpers for interpreting model output.

export const ERROR_MARKER = '[[ERROR]]';

export function splitError(text: string): { body: string; error: string | null } {
  const idx = text.indexOf(ERROR_MARKER);
  if (idx === -1) return { body: text, error: null };
  return {
    body: text.slice(0, idx).trimEnd(),
    error: text.slice(idx + ERROR_MARKER.length).trim() || 'The run failed.',
  };
}

// Strip a ```json ... ``` fence if the model added one, then JSON.parse.
export function tryParseJson(text: string): unknown | null {
  let t = text.trim();
  const fence = t.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
  if (fence) t = fence[1].trim();
  if (!t.startsWith('{') && !t.startsWith('[')) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
