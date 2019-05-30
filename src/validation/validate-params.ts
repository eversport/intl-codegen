import { Bundle, templateId } from "../bundle";
import { BUILTIN_TYPES, ParamType } from "../types";

export function validateParams(bundle: Bundle): void {
  const { typeDefs } = bundle;
  const template = bundle.getLocale(templateId).messages;

  // warn about parameter declarations with unknown types
  for (const id of template.keys()) {
    const { params } = template.get(id)!;

    // errors.setContext({ locale: "template", messageId: id });
    for (const param of params.values()) {
      const { name, type } = param;
      if (!BUILTIN_TYPES.has(type) && !typeDefs.has(type)) {
        bundle.raiseTypeError("unknown-type", `The parameter \`${name}\` has unknown type \`${type}\`.`);

        // fall back to string if the type was not known
        param.type = "string" as ParamType;
      }
    }
  }
}
