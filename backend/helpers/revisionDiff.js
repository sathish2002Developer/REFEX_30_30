const MAX_VALUE_LEN = 120;

function formatScalar(value) {
  if (value === null || value === undefined) return "(empty)";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return "(empty)";
    return t.length > MAX_VALUE_LEN ? `${t.slice(0, MAX_VALUE_LEN)}…` : t;
  }
  return String(value);
}

function formatValue(value) {
  if (Array.isArray(value)) {
    if (!value.length) return "(empty list)";
    if (value.every((v) => typeof v === "string" || typeof v === "number")) {
      const joined = value.map(String).join(", ");
      return joined.length > MAX_VALUE_LEN ? `${joined.slice(0, MAX_VALUE_LEN)}…` : joined;
    }
    return `[${value.length} items]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).length} fields}`;
  }
  return formatScalar(value);
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Flat diff: what changed when moving from `before` (archived) to `after` (next save / live).
 */
function computeRevisionChanges(before, after, path = "") {
  const changes = [];

  if (before === after) return changes;

  const beforeObj = before === undefined ? null : before;
  const afterObj = after === undefined ? null : after;

  if (
    beforeObj === null ||
    afterObj === null ||
    typeof beforeObj !== "object" ||
    typeof afterObj !== "object" ||
    Array.isArray(beforeObj) !== Array.isArray(afterObj)
  ) {
    if (JSON.stringify(beforeObj) !== JSON.stringify(afterObj)) {
      changes.push({
        field: path || "content",
        from: formatValue(beforeObj),
        to: formatValue(afterObj),
      });
    }
    return changes;
  }

  if (Array.isArray(beforeObj) && Array.isArray(afterObj)) {
    if (JSON.stringify(beforeObj) !== JSON.stringify(afterObj)) {
      changes.push({
        field: path || "list",
        from: formatValue(beforeObj),
        to: formatValue(afterObj),
      });
    }
    return changes;
  }

  const keys = new Set([
    ...Object.keys(beforeObj || {}),
    ...Object.keys(afterObj || {}),
  ]);

  for (const key of keys) {
    const nextPath = path ? `${path}.${key}` : key;
    changes.push(...computeRevisionChanges(beforeObj[key], afterObj[key], nextPath));
  }

  return changes;
}

module.exports = {
  computeRevisionChanges,
  formatValue,
};
