export function parseRequestedLanguages(languages: string | Array<string>) {
  if (Array.isArray(languages)) {
    return languages;
  }
  return acceptedLanguages(languages);
}

// Copied and adapted from: https://github.com/projectfluent/fluent.js/pull/262
function parseAcceptLanguageEntry(entry: string, index: number) {
  const langWithQ = entry.split(";").map(u => u.trim());
  let q = 1.0;
  if (langWithQ.length > 1) {
    const qVal = langWithQ[1].split("=").map(u => u.trim());
    if (qVal.length === 2 && qVal[0].toLowerCase() === "q") {
      const qn = Number(qVal[1]);
      q = isNaN(qn) ? 0.0 : qn;
    }
  }
  return { index, lang: langWithQ[0], q };
}

function acceptedLanguages(acceptLanguageHeader = "") {
  const tokens = acceptLanguageHeader
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  const langsWithQ = tokens.map(parseAcceptLanguageEntry);
  // order by q descending, keeping the header order for equal weights
  langsWithQ.sort((a, b) => (a.q === b.q ? a.index - b.index : b.q - a.q));
  return langsWithQ.map(t => t.lang);
}
