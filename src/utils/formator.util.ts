export function extractFieldPaths(
  obj: Record<string, any>,
  prefix = ""
): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      return value.flatMap((item, index) =>
        extractFieldPaths(item, `${path}[${index}]`)
      );
    } else if (typeof value === "object" && value !== null) {
      return extractFieldPaths(value, path);
    } else {
      return path;
    }
  });
}

export const defaultFormatter = (
  errs: Array<{
    code: string;
    message: string;
    where: Record<string, any>;
    details?: any;
  }>
) => ({
  errors: errs.map((e) => ({
    code: e.code,
    message: e.message,
    fields: extractFieldPaths(e.where || {}),
    ...(e.details ? { details: e.details } : {}),
  })),
});
