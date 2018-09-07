declare module "intl-messageformat-parser" {
  interface Node {
    type: string;
  }

  interface Option extends Node {
    type: "optionalFormatPattern";
    selector: string;
    value: Pattern;
  }

  interface NumberFormat extends Node {
    type: "numberFormat";
    style: string;
  }
  interface DateFormat extends Node {
    type: "dateFormat";
    style: string;
  }
  interface TimeFormat extends Node {
    type: "timeFormat";
    style: string;
  }
  interface SelectFormat extends Node {
    type: "selectFormat";
    options: Array<Option>;
  }
  interface PluralFormat extends Node {
    type: "pluralFormat";
    ordinal: boolean;
    offset: number;
    options: Array<Option>;
  }
  type Format = NumberFormat | DateFormat | TimeFormat | SelectFormat | PluralFormat;

  interface TextElement extends Node {
    type: "messageTextElement";
    value: string;
  }
  interface Argument extends Node {
    type: "argumentElement";
    id: string;
    format?: Format;
  }
  type Element = TextElement | Argument;

  interface Pattern extends Node {
    type: "messageFormatPattern";
    elements: Array<Element>;
  }

  type AllNodes = Element | Pattern;

  export function parse(message: string): Pattern;
}