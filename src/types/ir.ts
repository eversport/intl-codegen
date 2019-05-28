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

export type Placeable = NumberFormat | DateTimeFormat | MonetaryFormat | VariableReference;

export type Element = Text | Placeable;

export interface Pattern {
  type: "Pattern";
  elements: Array<Element>;
}
