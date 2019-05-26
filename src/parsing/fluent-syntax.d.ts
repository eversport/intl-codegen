declare module "fluent-syntax" {
  export interface Span {
    type: "Span";
    start: number;
    end: number;
  }

  export interface Node {
    type: string;
    span: Span;
  }

  export interface Comment extends Node {
    type: "Comment";
    content: string;
  }

  export interface Identifier extends Node {
    type: "Identifier";
    name: string;
  }

  export interface StringLiteral extends Node {
    type: "StringLiteral";
    value: string;
  }

  export interface NumberLiteral extends Node {
    type: "NumberLiteral";
    value: string;
  }

  export type Literal = StringLiteral | NumberLiteral;

  export interface VariableReference extends Node {
    type: "VariableReference";
    id: Identifier;
  }

  export interface TermReference extends Node {
    type: "TermReference";
    id: Identifier;
  }

  export interface MessageReference extends Node {
    type: "MessageReference";
    id: Identifier;
  }

  export type Selector = VariableReference | Literal;

  export interface FunctionReference extends Node {
    type: "FunctionReference";
    id: Identifier;
    arguments: CallArguments;
  }

  export interface CallArguments extends Node {
    type: "CallArguments";
    positional: Array<Selector>;
    named: Array<NamedArgument>;
  }

  export interface NamedArgument extends Node {
    type: "NamedArgument";
    name: Identifier;
    value: Literal;
  }

  export interface SelectExpression extends Node {
    type: "SelectExpression";
    selector: Selector;
    variants: Array<Variant>;
  }

  export interface VariantName extends Node {
    type: "VariantName";
    name: string;
  }

  export interface Variant extends Node {
    type: "Variant";
    key: NumberLiteral | Identifier;
    default: boolean;
    value: Pattern;
  }

  export type Expression = VariableReference | TermReference | MessageReference | FunctionReference | SelectExpression;

  export interface TextElement extends Node {
    type: "TextElement";
    value: string;
  }

  export interface Placeable extends Node {
    type: "Placeable";
    expression: Expression;
  }

  export type Element = TextElement | Placeable;

  export interface Pattern extends Node {
    type: "Pattern";
    elements: Array<Element>;
  }

  export interface Message extends Node {
    type: "Message";
    id: Identifier;
    value: Pattern;
    comment: Comment | null;
  }

  export interface Term extends Node {
    type: "Term";
    id: Identifier;
    value: Pattern;
    comment: Comment | null;
  }

  export interface Junk extends Node {
    type: "Junk";
  }

  export interface Resource extends Node {
    type: "Resource";
    body: Array<Message | Term | Comment | Junk>;
  }

  export function parse(ftl: string): Resource;
}
