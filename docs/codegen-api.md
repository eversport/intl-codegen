# Codegen API

From a high-level overview, `intl-codegen` has the concept of a message declaration
and corresponding localizations of that message.

You can provide declarations and localizations both in `fluent` as well as in
`MessageFormat` format.

A _declaration_ also needs to declare all the possible parameters that a message
can have. Each parameter needs to have a type, which can be either
`string`, `number`, `datetime`, `monetary` or `element`.

After declaring messages and providing localized versions, the code can be
generated or directly written to the filesystem.
The result may include a list of errors. The user of the API is responsible for
filtering and displaying those errors, or for failing the compile step depending
on the `error.id`.

NOTE that code will _always_ be generated, as `intl-codegen` will try to recover
from errors as much as possible.

## Example

```ts
const codegen = new IntlCodegen();

// step 1: define messages

// using fluent syntax
codegen.defineMessagesUsingFluent(`
# $param1 (datetime)
message-with-parameter = a message { $param1 }.
`);

// using messageformat syntax
codegen.defineMessageUsingMessageFormat("message-id", "a message {param1}", [{ name: "param1", type: "monetary" }]);

// afterwards, provide localized messages
codegen.addLocalizedMessagesUsingFluent(
  "de",
  `
message-with-parameter = Eine übersetzte Nachricht { $param1 }.
`,
);
codegen.addLocalizedMessageUsingMessageFormat("de", "message-id", "Nachricht {param1}");

// when done, generate the code, or write it directly to a directory:
const result = await codegen.write(path.resolve("my", "output", "directory"));

// the `result` has a list of errors that can be formatted and displayed.
for (const error of result.errors) {
  console.error(error.getFormattedMessage());
}
```
