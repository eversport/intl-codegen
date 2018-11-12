import { codeFrameColumns } from "@babel/code-frame";

interface Location {
  line: number;
  column: number;
}
interface Range {
  start: Location;
  end: Location;
}

export interface ErrorInfo {
  locale: string;
  id: string;
  code: string;
  loc: Range;
}

interface FormatErrorOptions extends ErrorInfo {
  message?: string;
}

function getCodeFrame(): typeof codeFrameColumns | undefined {
  try {
    const { codeFrameColumns } = require("@babel/code-frame");
    return codeFrameColumns;
  } catch {}
  return undefined;
}

export function logFormatError(msg: string, { locale, id, code, loc, message }: FormatErrorOptions) {
  console.warn(`[${locale}: ${id}]: ${msg}`);
  if (code) {
    const codeFrame = getCodeFrame();
    if (codeFrame) {
      console.log(codeFrame(code, loc, { message }));
    } else {
      console.log(code);
      console.log(message);
    }
  }
}
