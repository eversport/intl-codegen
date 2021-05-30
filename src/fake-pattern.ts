import { Location, MessageFormatElement, TYPE } from "@formatjs/icu-messageformat-parser";

/**
 * Create a fake AST that just has the given `text` and nothing else.
 */
export function createFakePattern(text: string): Array<MessageFormatElement> {
  // const span: Span = { type: "Span", start: 0, end: text.length };
  const location: Location = { start: { offset: 0 }, end: { offset: text.length } } as any;
  return [
    {
      type: TYPE.literal,
      value: text,
      location,
    },
  ];
}
