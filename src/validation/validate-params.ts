import { ErrorCollector } from "../errors";
import { Bundle } from "../types";

const BUILTIN_TYPES = new Set(["string", "number", "datetime", "monetary", "element"]);

export function validateType(name: string) {
  if (BUILTIN_TYPES.has(name)) {
    throw new ReferenceError(`The type "${name}" is a built-in type and cannot be re-defined`);
  }
}

export type TypeDefs = Map<string, Array<string>>;

export function validateParams(errors: ErrorCollector, bundle: Bundle, typeDefs: TypeDefs): void {
  const template = bundle.get("template")!.messages;

  // warn about parameter declarations with unknown types
  for (const id of template.keys()) {
    const { params } = template.get(id)!;

    errors.setContext({ locale: "template", messageId: id });
    for (const param of params.values()) {
      const { name, type } = param;
      if (!BUILTIN_TYPES.has(type) && !typeDefs.has(type)) {
        errors.unknownParamType(name, type);
        // fall back to string if the type was not known
        param.type = "string";
      }
    }
  }
}
