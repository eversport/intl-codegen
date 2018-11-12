export function camelify(str: string) {
  return str.replace(/-(\w|$)/g, (_, ch) => ch.toUpperCase());
}
