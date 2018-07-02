// as defined here:
// https://github.com/yahoo/intl-messageformat/blob/0cecaff663d2d73bf6602b71fab3b5e01d0ca16f/src/core.js#L65

export const defaultFormats = {
  number: {
    default: {},
    percent: {
      style: "percent",
    },
  },

  date: {
    short: {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    },

    medium: {
      month: "short",
      day: "numeric",
      year: "numeric",
    },

    long: {
      month: "long",
      day: "numeric",
      year: "numeric",
    },

    full: {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  },

  time: {
    short: {
      hour: "numeric",
      minute: "numeric",
    },

    medium: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    },

    long: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    },

    full: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    },
  },
};

export default function mergeFormats(formats: any = {}) {
  return {
    number: { ...defaultFormats.number, ...formats.number },
    date: { ...defaultFormats.date, ...formats.date },
    time: { ...defaultFormats.time, ...formats.time },
  };
}
