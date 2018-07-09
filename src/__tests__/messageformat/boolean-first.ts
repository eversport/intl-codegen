export default {
  message: "{simple, select, true {first} other {or only}}",
  cases: [
    {
      params: { simple: true },
    },
    {
      params: { simple: false },
    },
  ],
};
