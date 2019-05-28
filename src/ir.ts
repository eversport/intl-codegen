import { Text, Identifier, VariableReference, Literal, NumberFormat, DateTimeFormat, MonetaryFormat } from "./types";

export function text(value: string): Text {
  return { type: "Text", value };
}

export function lit(value: number | string): Literal {
  return { type: "Literal", value };
}

export function id(name: string): Identifier {
  return { type: "Identifier", name };
}

export function ref(name: string): VariableReference {
  return { type: "VariableReference", id: id(name) };
}

export function num(argument: Identifier | Literal, options: Intl.NumberFormatOptions = {}): NumberFormat {
  return { type: "NumberFormat", argument, options };
}

export function date(name: string, options: Intl.DateTimeFormatOptions = {}): DateTimeFormat {
  return { type: "DateTimeFormat", argument: id(name), options };
}

export function monetary(name: string, options: Intl.NumberFormatOptions = {}): MonetaryFormat {
  return { type: "MonetaryFormat", argument: id(name), options };
}
