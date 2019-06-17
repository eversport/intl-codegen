interface Formats {
  number: { [key: string]: Intl.NumberFormatOptions };
  date: { [key: string]: Intl.DateTimeFormatOptions };
  time: { [key: string]: Intl.DateTimeFormatOptions };
}

export const formats: Formats = {
  number: {
    percent: {
      style: "percent",
    },
    currency: {},
    currency0: {
      minimumFractionDigits: 0,
    },
    currencycode: {
      currencyDisplay: "code",
    },
    currencycode0: {
      currencyDisplay: "code",
      minimumFractionDigits: 0,
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

    withweekday: {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
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
      timeZoneName: "long",
    },
  },
};
