import { Span, Pattern } from "fluent-syntax";

/**
 * Create a fake AST that just has the given `text` and nothing else.
 */
export function createFakePattern(text: string): Pattern {
  const span: Span = { type: "Span", start: 0, end: text.length };
  return {
    type: "Pattern",
    elements: [
      {
        type: "TextElement",
        value: text,
        span,
      },
    ],
    span,
  };
}
