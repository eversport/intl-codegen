# $param (datetime)
fluent-date-as-number = { NUMBER($param) }

# $param (number)
fluent-number-as-date = { DATETIME($param) }

# $param (string)
fluent-string-as-ordinal = { $param }{ NUMBER($param, type: "ordinal") ->
  [one] st
  [two] nd
  [few] rd
  *[other] th
}

# this will *not* warn, as fluent does not have different syntax
# for plural vs normal selects
# $param (string)
fluent-string-as-plural = { $param } { $param ->
  [one] parameter
  *[other] parameters
}
