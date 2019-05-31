export function dashify(str: string) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}
