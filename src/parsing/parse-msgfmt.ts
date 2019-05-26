import Parser /*, * as MF*/ from "intl-messageformat-parser";
import { Params, MessageDefinitions } from "./types";
// import { Pattern, Location, Element } from "./ir";
import { ErrorCollector } from "../errors";

interface Options {
  errors: ErrorCollector;
  id: string;
  sourceText: string;
  params?: Params;
}

export function parseMsgFmt(options: Options): MessageDefinitions {
  const { errors, id, sourceText, params = new Map() } = options;

  const node = Parser.parse(sourceText);

  errors.setContext({ messageId: id });

  return new Map([
    [
      id,
      {
        id,
        params,
        sourceText,
        ast: node,
      },
    ],
  ]);

  // function loc({ location }: { location: MF.Location }): Location {
  //   return {
  //     sourceText,
  //     range: [location.start.offset, location.end.offset],
  //   };
  // }

  // function convertPattern(node: MF.MessageFormatPattern): Pattern {
  //   return {
  //     type: "Pattern",
  //     elements: node.elements.map(convertElement),
  //     location: loc(node),
  //   };
  // }

  // function convertElement(node: MF.Element): Element {
  //   if (node.type === "messageTextElement") {
  //     return {
  //       type: "Text",
  //       value: node.value,
  //       location: loc(node),
  //     };
  //   }

  //   let start = node.location.start.offset + 1;
  //   start += sourceText.indexOf(node.id, start);
  //   const end = start + node.id.length;
  //   const location = {
  //     sourceText,
  //     range: [start, end],
  //   } as const;

  //   if (!node.format) {
  //     return {
  //       type: "Placeable",
  //       id: { type: "Identifier", name: node.id, location },
  //       location: loc(node),
  //     };
  //   }

  //   errors.unsupportedSyntax(node);
  //   return {
  //     type: "Text",
  //     value: sourceText.slice(node.location.start.offset, node.location.end.offset),
  //     location: loc(node),
  //   };
  // }
}
