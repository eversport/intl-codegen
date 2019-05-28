import IntlCodegen from "../src";
import de from "deindent";

it("should run the playground :-)", async () => {
  const codegen = new IntlCodegen();

  codegen.defineMessagesUsingFluent(de`
a = a
b = b
  `);

  const result = await codegen.generate();
  console.log(result);
});
