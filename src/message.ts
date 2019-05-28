import { LocaleId, MessageId, Params } from "./types";
import { Pattern as FluentPattern } from "fluent-syntax";
import { MessageFormatPattern } from "intl-messageformat-parser";
import { Pattern } from "./types/ir";

type AST = FluentPattern | MessageFormatPattern;

/**
 * A `Message` is the basic unit of a translation.
 * It has an `id` and is specific to a `locale`.
 */
export class Message {
  public sourceText: string = undefined as any;
  public ast: AST = undefined as any;
  public ir: Pattern = undefined as any;

  private constructor(public locale: LocaleId, public id: MessageId, public params: Params = new Map()) {}

  public withPropsFrom(other: Message) {
    this.params = other.params;
    this.sourceText = other.sourceText;
    this.ast = other.ast;
    this.ir = other.ir;
    return this;
  }

  public withParseResult(sourceText: string, ast: AST) {
    this.sourceText = sourceText;
    this.ast = ast;
    return this;
  }

  public withIR(ir: Pattern) {
    this.ir = ir;
    return this;
  }
}
