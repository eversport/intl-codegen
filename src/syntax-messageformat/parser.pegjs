{
  let insideAttribute = false
  let insidePlural = false
}

start = Pattern

Pattern = body:PatternElement* {
  return {
    type: "Pattern",
    body,
    location: location(),
  };
}

PatternElement
  = Text / Argument / FormattedArgument / Select / Plural / PluralReference / Tag

Text = value:Chars {
  return {
    type: "Text",
    value,
    location: location(),
  };
}

Argument = "{" _ id:Id _ "}" {
  return {
    type: "Argument",
    id,
    location: location(),
  };
}

FormattedArgument = "{" _ id:Id _ "," _ format:FormatId _ style:Style? "}" {
  return {
    type: "FormattedArgument",
    id,
    format,
    style,
    location: location(),
  };
}

FormatId = ! "select" ! "plural" ! "selectordinal" format:Id { return format; }

Style = "," _ style:EscapedStyle _ {
  return style;
}

Select = "{" _ id:Id _ "," _ "select" _ "," _ options:SelectOption+ "}" {
  return {
    type: "Select",
    id,
    options,
    location: location(),
  };
}

SelectOption = selector:Id _ "{" body:PatternElement* "}" _ {
  return {
    type: "SelectOption",
    selector,
    body,
    location: location(),
  };
}

Plural = "{" _ id:Id _ "," _ kind:("plural" / "selectordinal") _ "," _ offset:PluralOffset? _ options:PluralOption+ "}" {
  return {
    type: "Plural",
    id,
    kind,
    offset,
    options,
    location: location(),
  };
}

PluralOffset = "offset" _ ":" _ num:Number _ {
  return num;
}

PluralOption = key:PluralKey _ "{" ! { insidePlural = true } body:PatternElement* "}" ! { insidePlural = false } _ {
  return {
    type: "PluralOption",
    key,
    body,
    location: location(),
  };
}

PluralKey
  = "zero" / "one" / "two" / "few" / "many" / "other"
  / "=" num:Number { return num; }

PluralReference = "#" & { return insidePlural; } {
  return {
    type: "PluralReference",
    location: location(),
  };
}

Tag = SelfClosingTag / FullTag

SelfClosingTag = "<" tagName:Id _ attributes:Attribute* "/>" {
  return {
    type: "Tag",
    tagName,
    attributes,
    body: undefined,
    location: location(),
  };
}

Attribute = name:Id _ "=" _ '"' ! { insideAttribute = true } value:Pattern '"' ! { insideAttribute = false } _ {
  return {
    type: "Attribute",
    name,
    value,
    location: location(),
  };
}

FullTag = "<" tagName:TagName _ attributes:Attribute* ">" body:PatternElement* closing:ClosingTag {
  if (tagName !== closing.tagName) {
    expected(`"</${tagName}>"`, closing.location)
  }
  return {
    type: "Tag",
    tagName,
    attributes,
    body,
    location: location(),
  };
}

TagName = $(Id ("-" Id)*)

ClosingTag = "</" tagName:TagName ">" {
  return {
    tagName,
    location: location(),
  };
}

EscapedStyle "a valid (strict) function parameter"
  = p:[^'{}]+ { return p.join(""); }
  / DoubleApostrophe
  / "'" quoted:InsideQuotes "'" { return quoted }
  / "{" style:EscapedStyle* "}" { return `{${style.join("")}}`; }

DoubleApostrophe = "''" { return "'"; }

InsideQuotes = DoubleApostrophe / str:[^']+ { return str.join(""); }

QuotedString
  = "'{" str:InsideQuotes* "'" { return "\u007B" + str.join(""); }
  / "'}" str:InsideQuotes* "'" { return "\u007D" + str.join(""); }
  / quotedHash:(("'#" str:InsideQuotes* "'" { return "#" + str.join(""); }) & { return insidePlural; }) { return quotedHash[0]; }
  / "'"

Char
  = DoubleApostrophe
  / QuotedString
  / "#" & { return !insidePlural; } { return "#"; }
  / '"' & { return !insideAttribute; } { return '"'; }
  / [^"{}<>#\0-\x08\x0e-\x1f\x7f]

Chars = str:Char+ {
  return str.join("");
}

Number = digits:("0" / $([1-9][0-9]*)) {
  return Number(digits);
}

// not Pattern_Syntax or Pattern_White_Space
Id "Identifier" = $([^\u0009-\u000d \u0085\u200e\u200f\u2028\u2029\u0021-\u002f\u003a-\u0040\u005b-\u005e\u0060\u007b-\u007e\u00a1-\u00a7\u00a9\u00ab\u00ac\u00ae\u00b0\u00b1\u00b6\u00bb\u00bf\u00d7\u00f7\u2010-\u2027\u2030-\u203e\u2041-\u2053\u2055-\u205e\u2190-\u245f\u2500-\u2775\u2794-\u2bff\u2e00-\u2e7f\u3001-\u3003\u3008-\u3020\u3030\ufd3e\ufd3f\ufe45\ufe46]+)

// Pattern_White_Space
_ "Whitespace" = $([\u0009-\u000d \u0085\u200e\u200f\u2028\u2029]*)
