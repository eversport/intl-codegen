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
