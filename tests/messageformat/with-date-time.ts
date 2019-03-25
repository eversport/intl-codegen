const params = {
  date: new Date("2018-07-02T00:00:00Z"),
  morning: new Date("2018-07-02T06:00:00Z"),
  afternoon: new Date("2018-07-02T18:00:00Z"),
};

export default {
  message: `With a Date: {date, date}; short: {date, date, short}; medium: {date, date, medium}; long: {date, date, long}; full: {date, date, full}
    And a time in the morning: {morning, time}; short: {morning, time, short}; medium: {morning, time, medium}; long: {morning, time, long}; full: {morning, time, full}
    And a time in the afternoon: {afternoon, time}; short: {afternoon, time, short}; medium: {afternoon, time, medium}; long: {afternoon, time, long}; full: {afternoon, time, full}
    `.trim(),
  cases: [
    {
      locale: "en",
      params,
    },
    {
      locale: "de",
      params,
    },
  ],
};
