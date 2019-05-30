import { Location, MessageFormatPattern } from "intl-messageformat-parser";

/**
 * Create a fake AST that just has the given `text` and nothing else.
 */
export function createFakePattern(text: string): MessageFormatPattern {
  // const span: Span = { type: "Span", start: 0, end: text.length };
  const location: Location = { start: { offset: 0 }, end: { offset: text.length } } as any;
  return {
    type: "messageFormatPattern",
    elements: [
      {
        type: "messageTextElement",
        value: text,
        location,
      },
    ],
    location,
  };
}
