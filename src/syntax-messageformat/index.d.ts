import { FormattedArgument } from "../Message";

interface Location {
  offset: number;
  line: number;
  column: number;
}

interface Range {
  start: Location;
  end: Location;
}

interface Node {
  type: string;
  location: Range;
}

interface Pattern extends Node {
  type: "Pattern";
  body: Body;
}

interface Argument extends Node {
  type: "Argument";
  id: string;
}

interface FormattedArgument extends Node {
  type: "FormattedArgument";
  id: string;
  format: string;
  style?: string;
}

interface Select extends Node {
  type: "Select";
  id: string;
  options: Array<SelectOption>;
}

interface SelectOption extends Node {
  type: "SelectOption";
  selector: string;
  body: Body;
}

interface Plural extends Node {
  type: "Plural";
  id: string;
  kind: "plural" | "selectordinal";
  offset?: number;
  options: Array<PluralOption>;
}

interface PluralOption extends Node {
  type: "PluralOption";
  key: number | "zero" | "one" | "two" | "few" | "many" | "other";
  body: Body;
}

interface PluralReference extends Node {
  type: "PluralReference";
}

interface Tag extends Node {
  type: "Tag";
  tagName: string;
  attributes: Array<Attribute>;
  body?: Body;
}

interface Attribute extends Node {
  type: "Attribute";
  name: string;
  value: Pattern;
}

type Body = Array<Text | Argument | FormattedArgument | Select | Plural | PluralReference | Tag>;

declare const _default: {
  parse: (source: string) => Pattern;
};

export default _default;
