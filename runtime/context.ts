export interface MonetaryValue {
  value: number;
  currency: string;
}

export class Context {
  constructor(private readonly locale: string) {}

  /** createDateFormatter */
  d(options: Intl.DateTimeFormatOptions) {
    const formatter = new Intl.DateTimeFormat(this.locale, options);
    return (date: Date) => formatter.format(date);
  }

  /** createNumberFormatter */
  n(options: Intl.NumberFormatOptions) {
    const formatter = new Intl.NumberFormat(this.locale, options);
    return (num: number) => formatter.format(num);
  }

  /** createMonetaryFormatter */
  m(options: Intl.NumberFormatOptions) {
    const formatterCache: { [currency: string]: Intl.NumberFormat } = {};
    return ({ currency, value }: MonetaryValue) => {
      let formatter = formatterCache[currency];
      if (!formatter) {
        formatter = formatterCache[currency] = new Intl.NumberFormat(this.locale, {
          ...options,
          style: "currency",
          currency,
        });
      }
      return formatter.format(value);
    };
  }
}
