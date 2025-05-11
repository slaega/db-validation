/**
 * Flattens a nested object's keys into an array of dot-notation paths
 * @param obj The object to flatten
 * @param prefix Optional prefix for nested keys
 * @returns Array of flattened key paths
 * @example
 * flattenKeys({ a: { b: 1 } }) // ['a.b']
 * flattenKeys({ a: { b: { c: 1 } } }) // ['a.b.c']
 */
function flattenKeys(obj: Record<string, any>, prefix: string = ''): string[] {
  let keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      // Recursively flatten nested objects
      keys = keys.concat(flattenKeys(value, newKey));
    } else {
      // Add leaf node key
      keys.push(newKey);
    }
  }

  return keys;
}