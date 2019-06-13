export type NumberValue = number;
export type DateTimeValue = Date;

export interface MonetaryValue {
  readonly value: number;
  readonly currency: string;
}

/**
 * The `LocaleInfo` will give some insight into which locale was requested, loaded,
 * and is being used for formatters.
 */
export interface LocaleInfo<Locales> {
  /**
   * This is the locale that has been requested with the `loadLanguage` call.
   * This typically comes from the `Accept-Language` header,
   * or the `navigator.languages` property.
   */
  readonly requested: string | Array<string>;
  /**
   * This is the id of locale pack that was actually loaded, or `"template"`, if
   * none of the available locales matched the one `requested`.
   * For example, when `de-DE` was requested, but only translations for `de` were
   * provided, this will return `de`.
   * When `hu-HU` was requested but only translations for `de` are available, it
   * will return `template`.
   */
  readonly loaded: Locales;
  /**
   * This is the locale that is being used for number, date and currency formatting,
   * as well as for plural selection.
   * It is essentially the `"best fit"` result of the `Intl`
   * [Locale negotiation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation)
   * algorithm and will match as closely as possible the `requested` locale, as
   * far as the platform supports.
   */
  readonly formatter: string;
}

/**
 * The context includes some helpers to create formatter functions and to deal
 * with plurals, as well as the resolved `LocaleInfo`.
 */
export class Context<Locales> {
  private plural?: Intl.PluralRules;
  private ordinal?: Intl.PluralRules;

  constructor(public readonly locale: LocaleInfo<Locales>) {
    if (Intl.PluralRules) {
      this.plural = new Intl.PluralRules(locale.formatter);
      this.ordinal = new Intl.PluralRules(locale.formatter, { type: "ordinal" });
    }
  }

  /**
   * This returns the appropriate plural rule for the provided `num`, according
   * to the `formatter` locale.
   * See [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/PluralRules)
   * for more details.
   */
  selectPlural(num: NumberValue) {
    return this.plural ? this.plural.select(num) : "other";
  }

  /**
   * This returns the appropriate ordinal rule for the provided `num`, according
   * to the `formatter` locale.
   * See [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/PluralRules)
   * for more details.
   */
  selectOrdinal(num: NumberValue) {
    return this.ordinal ? this.ordinal.select(num) : "other";
  }

  /**
   * This creates a reusable date formatting function with optional `options`, according
   * to the `formatter` locale.
   * See [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)
   * for more details.
   */
  createDateFormatter(options?: Intl.DateTimeFormatOptions): (date: DateTimeValue) => string {
    const formatter = new Intl.DateTimeFormat(this.locale.formatter, options);
    return date => formatter.format(date);
  }

  /**
   * This creates a reusable number formatting function with optional `options`, according
   * to the `formatter` locale.
   * See [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)
   * for more details.
   */
  createNumberFormatter(options?: Intl.NumberFormatOptions): (num: NumberValue) => string {
    const formatter = new Intl.NumberFormat(this.locale.formatter, options);
    return num => formatter.format(num);
  }

  /**
   * This creates a reusable formatting function for monetary values, with optional `options`, according
   * to the `formatter` locale.
   * The formatter will have `style: "currency"`, and will use the `currency` as
   * provided by the monetary value.
   * See [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)
   * for more details.
   */
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
