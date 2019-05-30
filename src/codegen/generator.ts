const ID_RE = /^[A-Za-z_$][$\w]*$/;

export abstract class CodeGenerator {
  protected indent = 0;
  protected code = "";
  protected line(line: string) {
    this.code += "\n" + "  ".repeat(this.indent) + line;
  }
  protected blank() {
    this.code += "\n";
  }
  protected append(s: string) {
    this.code += s;
  }
  protected finish() {
    return this.code.trim() + "\n";
  }
  protected isId(name: string) {
    return ID_RE.test(name);
  }
}
