# $param (number)
fluent-select = { $param ->
  [0] no items
  [one] one item
  *[other] { $param } items
}
