export function stable(json: unknown): string {
  if (typeof json === "object" && json) {
    const keys = Object.keys(json);
    keys.sort((a, b) => a.localeCompare(b));
    if (!keys.length) {
      return "{}";
    }
    return `{ ${keys
      .map(key => `${isId(key) ? key : JSON.stringify(key)}: ${stable((json as any)[key])}`)
      .join(", ")} }`;
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
