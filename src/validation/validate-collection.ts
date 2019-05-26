import { MessageCollection, MessageId } from "../parsing";
import { ErrorCollector } from "../errors";
import { Span } from "fluent-syntax";

export function validateCollection(errors: ErrorCollector, collection: MessageCollection): void {
  const template = collection.get("template")!;

  // get *all* the used message IDs
  const allIds = new Set<MessageId>();
  for (const defs of collection.values()) {
    for (const id of defs.keys()) {
      allIds.add(id);
    }
  }

  // warn about undefined messages and add an empty definition
  for (const id of allIds) {
    if (!template.has(id)) {
      errors.messageNotDefined(id);

      // create a fake fluent AST that just has the message-id as content
      const span: Span = { type: "Span", start: 0, end: id.length };
      template.set(id, {
        id,
        params: new Map(),
        sourceText: id,
        ast: {
          type: "Pattern",
          elements: [
            {
              type: "TextElement",
              value: id,
              span,
            },
          ],
          span,
        },
      });
    }
  }

  // warn about un-localized messages and replace those with the template
  for (const [locale, defs] of collection) {
    if (locale === "template") {
      continue;
    }
    errors.setContext({ locale });
    for (const id of allIds) {
      if (!defs.has(id)) {
        errors.messageNotLocalized(id);

        const templateMsg = template.get(id)!;
        defs.set(id, {
          id,
          params: templateMsg.params,
          sourceText: templateMsg.sourceText,
          ast: templateMsg.ast,
        });
      }
    }
  }
}
