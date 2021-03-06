import { Bundle, templateId } from "../bundle";
import { createFakePattern } from "../fake-pattern";
import { Message } from "../message";
import { MessageId, LocaleId } from "../types";

export function validateCollection(bundle: Bundle): void {
  const template = bundle.getLocale(templateId);
  const fallback = bundle.options.fallbackLocale
    ? bundle.getLocale(bundle.options.fallbackLocale as LocaleId)
    : template;

  // get *all* the used message IDs
  const allIds = new Set<MessageId>();
  for (const locales of bundle.locales.values()) {
    for (const id of locales.messages.keys()) {
      allIds.add(id);
    }
  }

  // warn about undefined messages and add an empty definition
  for (const id of allIds) {
    if (!template.messages.has(id)) {
      bundle.raiseError("undefined-message", `Message \`${id}\` has no definition.`, {
        localeId: "template",
        messageId: id,
      });

      // create a fake fluent AST that just has the message-id as content
      const msg = new Message(templateId, id).withParseResult(id, createFakePattern(id));
      template.messages.set(id, msg);
    }
  }

  // warn about un-localized messages and replace those with the template
  for (const locale of bundle.locales.values()) {
    if (locale === template) {
      continue;
    }

    for (const id of allIds) {
      let msg = locale.messages.get(id);
      const templateMsg = template.messages.get(id)!;
      const fallbackMsg = fallback.messages.get(id);
      if (!msg) {
        bundle.raiseError(
          "unlocalized-message",
          `Message \`${id}\` has no localization for locale \`${locale.locale}\`.`,
          {
            localeId: locale.locale,
            messageId: id,
          },
        );

        msg = new Message(locale.locale, id).withPropsFrom(fallbackMsg || templateMsg);
        locale.messages.set(id, msg);
      } else {
        // copy over the params from the template, so that each message has
        // the same set of param definitions that are used later for IR generation
        msg.params = templateMsg.params;
      }
    }
  }
}
