import { Message as FluentMessage } from "fluent-syntax";
import { MessageFormatPattern } from "intl-messageformat-parser";
import { convertFluent, convertMsgFmt } from "./lowering";
import { LocaleId, MessageId, Params } from "./types";
import { Pattern } from "./types/ir";

type AST = FluentMessage | MessageFormatPattern;

/**
 * A `Message` is the basic unit of a translation.
 * It has an `id` and is specific to a `locale`.
 */
export class Message {
  public sourceText: string = undefined as any;
  public ast: AST = undefined as any;
  public ir: Pattern = undefined as any;

  constructor(public locale: LocaleId, public id: MessageId, public params: Params = new Map()) {}

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

  public lower() {
    this.ir = this.ast.type === "Message" ? convertFluent(this) : convertMsgFmt(this);
  }

  public withIR(ir: Pattern) {
    this.ir = ir;
    return this;
  }
}
