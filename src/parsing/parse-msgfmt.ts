import Parser from "intl-messageformat-parser";
import { Params, MessageDefinitions, LocaleId } from "../types";
import { ErrorCollector } from "../errors";

interface Options {
  errors: ErrorCollector;
  locale: LocaleId;
  id: string;
  sourceText: string;
  params?: Params;
}

export function parseMsgFmt(options: Options): MessageDefinitions {
  const definitions: MessageDefinitions = new Map();
  const { errors, locale, id, sourceText, params = new Map() } = options;

  errors.setContext({ messageId: id });

  try {
    const node = Parser.parse(sourceText);

    definitions.set(id, {
      locale,
      id,
      params,
      sourceText,
      ast: node,
      ir: undefined as any,
    });
  } catch (error) {
    // TODO: raise parse error
  }

  return definitions;
}
