export default {
  message: "with a boolean that is {simple, select, true {truthy} other {falsy}}",
  cases: [
    {
      params: { simple: true },
    },
    {
      params: { simple: false },
    },
  ],
};
