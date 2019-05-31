# $param (number)
fluent-select = { $param }{ NUMBER($param, type: "ordinal") ->
  [one] st
  [two] nd
  [few] rd
  *[other] th
}
