export default {
  languages: {
    en: {
      test: "with a {parameter}",
    }
  },
  code: `
import React from "react";
import { Localized } from "./lang";

(<Localized id="test" params={{ parameter: "parameter" }} />)
  `
}
