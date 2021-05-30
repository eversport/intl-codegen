import { Message as FluentMessage } from "@fluent/syntax";
import { MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import { convertFluent, convertMsgFmt } from "./lowering";
import { LocaleId, MessageId, Params } from "./types";
import { Pattern } from "./types/ir";
import { Bundle } from "./bundle";

type AST = FluentMessage | Array<MessageFormatElement>;

/**
 * A `Message` is the basic unit of a translation.
 * It has an `id` and is specific to a `locale`.
 */
export class Message {
  public sourceText: string = undefined as any;
  public ast: AST = undefined as any;
  public ir: Pattern = undefined as any;

  constructor(public localeId: LocaleId, public messageId: MessageId, public params: Params = new Map()) {}

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

  public lower(bundle: Bundle) {
    this.ir = Array.isArray(this.ast) ? convertMsgFmt(bundle, this) : convertFluent(bundle, this);
  }

  public withIR(ir: Pattern) {
    this.ir = ir;
    return this;
  }
}
