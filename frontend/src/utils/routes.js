export function parseUserId(value) {
  if (value == null || value === "") return 1;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;

  return parsed;
}

export function homePath(userId) {
  return `/?user=${userId}`;
}

export function homeworkPath(id, userId) {
  return `/homework/${id}?user=${userId}`;
}
