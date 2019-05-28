import { ErrorCollector } from "../errors";
import { Bundle, MessageId } from "../types";
import { createFakePattern } from "../parsing";

export function validateCollection(errors: ErrorCollector, bundle: Bundle): void {
  const template = bundle.get("template")!.messages;

  // get *all* the used message IDs
  const allIds = new Set<MessageId>();
  for (const defs of bundle.values()) {
    for (const id of defs.messages.keys()) {
      allIds.add(id);
    }
  }

  // warn about undefined messages and add an empty definition
  for (const id of allIds) {
    if (!template.has(id)) {
      errors.messageNotDefined(id);

      // create a fake fluent AST that just has the message-id as content
      template.set(id, {
        locale: "template",
        id,
        params: new Map(),
        sourceText: id,
        ast: createFakePattern(id),
        ir: undefined as any,
      });
    }
  }

  // warn about un-localized messages and replace those with the template
  for (const [locale, defs] of bundle) {
    if (locale === "template") {
      continue;
    }
    errors.setContext({ locale });
    for (const id of allIds) {
      if (!defs.messages.has(id)) {
        errors.messageNotLocalized(id);

        const templateMsg = template.get(id)!;
        defs.messages.set(id, {
          locale,
          id,
          params: templateMsg.params,
          sourceText: templateMsg.sourceText,
          ast: templateMsg.ast,
          ir: undefined as any,
        });
      }
    }
  }
}
