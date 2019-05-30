export * from "./ir";

type Tagged<T, Kind> = T & { _kind: Kind };

export type LocaleId = Tagged<string, "Locale">;
export type ParamId = Tagged<string, "Param">;
export type ParamType = Tagged<string, "ParamType">;
export type MessageId = Tagged<string, "Message">;

export interface Param {
  name: ParamId;
  type: ParamType;
}
export type Params = Map<ParamId, Param>;

export type TypeDefs = Map<ParamType, Array<string>>;

export const BUILTIN_TYPES = new Set(["string", "number", "datetime", "monetary", "element"]);
export function validateParamType(name: string): ParamType {
  if (BUILTIN_TYPES.has(name)) {
    throw new ReferenceError(`The type "${name}" is a built-in type and cannot be re-defined`);
  }
  return name as ParamType;
}

export function validateLocaleId(locale: string): LocaleId {
  if (locale === "template") {
    throw new ReferenceError(`Locale "${locale}" is reserved for internal use`);
  }
  return locale as LocaleId;
}

export function validateMessageId(id: string): MessageId {
  if (id === "context") {
    throw new ReferenceError(`Message "${id}" is reserved for internal use`);
  }
  return id as MessageId;
}
