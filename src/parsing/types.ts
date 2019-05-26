import { Pattern } from "fluent-syntax";
import { MessageFormatPattern } from "intl-messageformat-parser";

export type ParamId = string;
export type MessageId = string;
export type Locale = string;

export interface Param {
  name: ParamId;
  type: string;
}
export type Params = Map<ParamId, Param>;

export interface MessageDefinition {
  id: MessageId;
  params: Params;
  sourceText: string;
  ast: Pattern | MessageFormatPattern;
}
export type MessageDefinitions = Map<MessageId, MessageDefinition>;

export type MessageCollection = Map<Locale, MessageDefinitions>;
