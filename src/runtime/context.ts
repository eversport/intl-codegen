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
  private plural?: Intl.PluralRules;
  private ordinal?: Intl.PluralRules;

  constructor(public readonly locale: LocaleInfo<Locales>) {
    if (Intl.PluralRules) {
      this.plural = new Intl.PluralRules(locale.formatter);
      this.ordinal = new Intl.PluralRules(locale.formatter, { type: "ordinal" });
    }
  }

  selectPlural(num: NumberValue) {
    return this.plural ? this.plural.select(num) : "other";
  }

  selectOrdinal(num: NumberValue) {
    return this.ordinal ? this.ordinal.select(num) : "other";
  }

  createDateFormatter(options?: Intl.DateTimeFormatOptions): (date: DateTimeValue) => string {
    const formatter = new Intl.DateTimeFormat(this.locale.formatter, options);
    return date => formatter.format(date);
  }

  createNumberFormatter(options?: Intl.NumberFormatOptions): (num: NumberValue) => string {
    const formatter = new Intl.NumberFormat(this.locale.formatter, options);
    return num => formatter.format(num);
  }

  createMonetaryFormatter(options?: Intl.NumberFormatOptions): (monetary: MonetaryValue) => string {
    const formatterCache: { [currency: string]: Intl.NumberFormat } = {};
    return ({ currency, value }) => {
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
(proto as any).p = proto.selectPlural;
(proto as any).o = proto.selectOrdinal;
(proto as any).d = proto.createDateFormatter;
(proto as any).n = proto.createNumberFormatter;
(proto as any).m = proto.createMonetaryFormatter;
