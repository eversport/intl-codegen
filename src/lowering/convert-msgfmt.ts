// import * as mf from "intl-messageformat-parser";
// import { Pattern, Location, Element } from "./ir";

// function convertMsgFmt(sourceText: string) {
//   function loc({ location }: { location: mf.Location }): Location {
//     return {
//       sourceText,
//       range: [location.start.offset, location.end.offset],
//     };
//   }

//   function convertPattern(node: mf.MessageFormatPattern): Pattern {
//     return {
//       type: "Pattern",
//       elements: node.elements.map(convertElement),
//       location: loc(node),
//     };
//   }

//   function convertElement(node: mf.Element): Element {
//     if (node.type === "messageTextElement") {
//       return {
//         type: "Text",
//         value: node.value,
//         location: loc(node),
//       };
//     }

//     let start = node.location.start.offset + 1;
//     start += sourceText.indexOf(node.id, start);
//     const end = start + node.id.length;
//     const location = {
//       sourceText,
//       range: [start, end],
//     } as const;

//     if (!node.format) {
//       return {
//         type: "Placeable",
//         id: { type: "Identifier", name: node.id, location },
//         location: loc(node),
//       };
//     }

//     errors.unsupportedSyntax(node);
//     return {
//       type: "Text",
//       value: sourceText.slice(node.location.start.offset, node.location.end.offset),
//       location: loc(node),
//     };
//   }
// }
