function flattenKeys(obj: Record<string, any>, prefix: string = ''): string[] {
    let keys: string[] = [];
  
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
  
      if (typeof value === 'object' && value !== null) {
        keys = keys.concat(flattenKeys(value, newKey));  // si c'est un objet, on descend plus profondément
      } else {
        keys.push(newKey);  // sinon, on ajoute la clé à la liste
      }
    }
  
    return keys;
  }
  