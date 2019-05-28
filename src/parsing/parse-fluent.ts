import { parse } from "fluent-syntax";
import { MessageDefinitions, Params, LocaleId } from "../types";
import { ErrorCollector } from "../errors";

// a "real" parser would be nice, but I will take my chances with
// regexp for now…
const PARAM_RE = /^\s*\$(\w+)(\s+\((\w+)\))?/g;
function parseParams(comment: string): Params {
  const params: Params = new Map();

  let matches;
  while ((matches = PARAM_RE.exec(comment)) !== null) {
    const [, name, , type] = matches;
    params.set(name, { name, type });
  }

  return params;
}

export function parseFluent(errors: ErrorCollector, locale: LocaleId, sourceText: string): MessageDefinitions {
  const definitions: MessageDefinitions = new Map();

  const ast = parse(sourceText);

  for (const node of ast.body) {
    if (node.type === "Message") {
      const id = node.id.name;
      const params = parseParams(node.comment ? node.comment.content : "");

      errors.setContext({ messageId: id });

      definitions.set(id, {
        locale,
        id,
        params,
        sourceText,
        ast: node.value,
        ir: undefined as any,
      });
    } else if (node.type === "Comment") {
    } else {
      errors.setContext({ messageId: undefined });
      errors.unsupportedSyntax(node);
    }
  }

  return definitions;
}
