export default {
  languages: {
    en: {
      test: "with a {parameter}",
    },
  },
  code: `
import React from "react";
import { withIntl, WithIntl } from "./lang";

interface MyProps extends WithIntl {
  prop: string;
}

// @ts-ignore: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
const MyFunc: React.SFC<MyProps> = ({ prop, intl }) => {
  return intl.test({ parameter: prop });
}

class MyClass extends React.Component<MyProps> {
  render() {
    const { prop, intl } = this.props;
    return intl.test({ parameter: prop });
  }
}

const WrappedFunc = withIntl(MyFunc);
const WrappedClass = withIntl(MyClass);

(async function test() {
  return (
    <>
      <WrappedFunc prop="test" />
      <WrappedClass prop="test" />
      {/* errors below */}
      <WrappedFunc />
      <WrappedClass />
    </>
  );
})();
  `,
};
