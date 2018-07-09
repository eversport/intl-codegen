export default {
  message: `a message with {plural, plural,
    =1 {a simple plural}
    =2 {two simple plurals}
    other {{plural, number} simple plurals}}`,
  cases: [
    {
      params: { plural: 1 },
    },
    {
      params: { plural: 2 },
    },
    {
      params: { plural: 0 },
    },
  ],
};
