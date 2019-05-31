# $num (monetary)
fluent-monetary =
  currency: { NUMBER($num) }
  currency0: { NUMBER($num, minimumFractionDigits: 0) }
  currencycode: { NUMBER($num, currencyDisplay: "code") }
  currencycode0: { NUMBER($num, currencyDisplay: "code", minimumFractionDigits: 0) }
