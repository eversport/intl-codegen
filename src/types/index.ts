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
