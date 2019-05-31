export interface Text {
  type: "Text";
  value: string;
}

export interface Identifier {
  type: "Identifier";
  name: string;
}

export interface Literal {
  type: "Literal";
  value: number | string;
}

export interface NumberFormat {
  type: "NumberFormat";
  argument: Literal | Identifier;
  options: Intl.NumberFormatOptions;
}

export interface DateTimeFormat {
  type: "DateTimeFormat";
  argument: Literal | Identifier;
  options: Intl.DateTimeFormatOptions;
}

export interface MonetaryFormat {
  type: "MonetaryFormat";
  argument: Identifier;
  options: Intl.NumberFormatOptions;
}

export interface VariableReference {
  type: "VariableReference";
  id: Identifier;
}

export interface Variant {
  key: Literal;
  value: Pattern;
}

type SelectType = "plural" | "ordinal";

export interface Select {
  type: "Select";
  argument: Literal | Identifier;
  selectType?: SelectType;
  // The **first** (!) variant is always the default case!
  variants: Array<Variant>;
}

export type Placeable = NumberFormat | DateTimeFormat | MonetaryFormat | VariableReference;

export type Element = Text | Placeable | Select;

export interface Pattern {
  type: "Pattern";
  elements: Array<Element>;
}

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

export function select(argument: Identifier | Literal, variants: Array<Variant>, type?: SelectType): Select {
  return { type: "Select", argument, selectType: type, variants };
}

export function variant(key: number | string, ...elements: Array<Element>): Variant {
  return {
    key: lit(key),
    value: {
      type: "Pattern",
      elements,
    },
  };
}
