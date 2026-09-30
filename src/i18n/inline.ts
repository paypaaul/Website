export interface InlineSegment {
  text: string;
  bold: boolean;
}

/**
 * Splits a string with `**bold**` markers into segments. Templates render the segments with
 * <strong> or plain text, so translated strings never need `set:html` (and can never inject markup).
 *
 * @example parseInline('Integrazione **SSC32-V2.5** per jitter.')
 *   // [{ text: 'Integrazione ', bold: false }, { text: 'SSC32-V2.5', bold: true }, { text: ' per jitter.', bold: false }]
 */
export function parseInline(input: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  input.split('**').forEach((text, index) => {
    if (text) segments.push({ text, bold: index % 2 === 1 });
  });
  return segments;
}
