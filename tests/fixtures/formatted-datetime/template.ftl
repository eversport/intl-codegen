# $d (datetime)
fluent-datetime =
  date, default: { DATETIME($d) }
  date, short: { DATETIME($d, day: "numeric", month: "numeric", year: "2-digit") }
  date, medium: { DATETIME($d, day: "numeric", month: "short", year: "numeric") }
  date, long: { DATETIME($d, day: "numeric", month: "long", year: "numeric") }
  date, full: { DATETIME($d, day: "numeric", month: "long", year: "numeric", weekday: "long") }
  time, short: { DATETIME($d, hour: "numeric", minute: "numeric") }
  time, medium: { DATETIME($d, hour: "numeric", minute: "numeric", second: "numeric") }
  time, long: { DATETIME($d, hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "short") }
  time, full: { DATETIME($d, hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "long") }
