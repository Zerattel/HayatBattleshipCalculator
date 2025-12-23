function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;

  const source = sources.shift();

  if (isPlainObject(target) && isPlainObject(source)) {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isPlainObject(sourceValue)) {
        result[key] = isPlainObject(targetValue)
          ? mergeDeep(targetValue, sourceValue)
          : mergeDeep({}, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }

    return mergeDeep(result, ...sources);
  }

  return mergeDeep(source, ...sources);
}