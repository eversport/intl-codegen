import { Message } from "../message";

export function stable(json: unknown): string {
  if (typeof json === "object" && json) {
    const keys = Object.keys(json);
    if (!keys.length) {
      return "{}";
    }
    return `{ ${keys.map(key => `${JSON.stringify(key)}: ${stable((json as any)[key])}`).join(", ")} }`;
  }
  return JSON.stringify(json);
}

export function camelify(str: string) {
  return str.replace(/[_-](\w|$)/g, (_, ch) => ch.toUpperCase());
}

const ID_RE = /^[A-Za-z_$][$\w]*$/;
export function isId(name: string) {
  return ID_RE.test(name);
}

export function hasElementParameter(message: Message) {
  for (const param of message.params.values()) {
    if (param.type === "element") {
      return true;
    }
  }
  return false;
}
