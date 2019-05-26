export default {
  message: "with a boolean that is {simple, select, true {truthy} false {falsy}}",
  cases: [
    {
      params: { simple: true },
    },
    {
      params: { simple: false },
    },
  ],
};
