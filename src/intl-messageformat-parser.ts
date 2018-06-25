declare module "intl-messageformat-parser" {
  interface Node {
    type: string;
  }

  interface Option extends Node {
    type: "optionalFormatPattern";
    selector: string;
    value: Pattern;
  }

  interface Select extends Node {
    type: "selectFormat";
    options: Array<Option>;
  }
  type Format = Select;

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
