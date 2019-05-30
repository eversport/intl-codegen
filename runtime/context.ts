export type NumberValue = number;
export type DateTimeValue = Date;

export interface MonetaryValue {
  readonly value: number;
  readonly currency: string;
}

export interface LocaleInfo<Locales> {
  readonly requested: string | Array<string>;
  readonly loaded: Locales;
  readonly formatter: string;
}

export class Context<Locales> {
  constructor(public readonly locale: LocaleInfo<Locales>) {}

  createDateFormatter(options: Intl.DateTimeFormatOptions) {
    const formatter = new Intl.DateTimeFormat(this.locale.formatter, options);
    return (date: DateTimeValue) => formatter.format(date);
  }

  createNumberFormatter(options: Intl.NumberFormatOptions) {
    const formatter = new Intl.NumberFormat(this.locale.formatter, options);
    return (num: NumberValue) => formatter.format(num);
  }

  createMonetaryFormatter(options: Intl.NumberFormatOptions) {
    const formatterCache: { [currency: string]: Intl.NumberFormat } = {};
    return ({ currency, value }: MonetaryValue) => {
      let formatter = formatterCache[currency];
      if (!formatter) {
        formatter = formatterCache[currency] = new Intl.NumberFormat(this.locale.formatter, {
          ...options,
          style: "currency",
          currency,
        });
      }
      return formatter.format(value);
    };
  }
}

const proto = Context.prototype;

// define some minifier-friendly aliases that are used inside the generated
// translations
(proto as any).d = proto.createDateFormatter;
(proto as any).n = proto.createNumberFormatter;
(proto as any).m = proto.createMonetaryFormatter;
