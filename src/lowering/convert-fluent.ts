// import * as fluent from "fluent-syntax";
// import { Location, Element, Pattern } from "./ir";

// function convertFluent(sourceText: string) {
//   function loc({ span }: { span: fluent.Span }): Location {
//     return {
//       sourceText,
//       range: [span.start, span.end],
//     };
//   }

//   function convertPattern(node: fluent.Pattern): Pattern {
//     return {
//       type: "Pattern",
//       elements: node.elements.map(convertElement),
//       location: loc(node),
//     };
//   }

//   function convertElement(node: fluent.Element): Element {
//     if (node.type === "TextElement") {
//       return {
//         type: "Text",
//         value: node.value,
//         location: loc(node),
//       };
//     } else if (node.type === "Placeable" && node.expression.type === "VariableReference") {
//       return {
//         type: "Placeable",
//         id: {
//           type: "Identifier",
//           name: node.expression.id.name,
//           location: loc(node.expression.id),
//         },
//         location: loc(node),
//       };
//     }

//     errors.unsupportedSyntax(node);
//     return {
//       type: "Text",
//       value: sourceText.slice(node.span.start, node.span.end),
//       location: loc(node),
//     };
//   }
// }
