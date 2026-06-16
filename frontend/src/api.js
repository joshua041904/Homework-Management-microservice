import { ApiError, parseApiErrorBody } from "./utils/errors.js";

const API_BASE = "/api";

/**
 * Minimal API helper with good errors.
 * - Uses same-origin + Vite proxy → gateway.
 */
export async function api(path, { method = "GET", body, headers } = {}) {
  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw error;
  }

  const text = await res.text();

  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      detail: parseApiErrorBody(text),
      body: text,
      statusText: res.statusText,
    });
  }

  // Some endpoints return plain text (health), others JSON.
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return JSON.parse(text);
  return text;
}

export function listHomeworkForUser(userId) {
  return api(`/homework/users/${userId}/homework`);
}

export function createUser(payload) {
  // Note trailing slash behavior is handled by nginx, but we avoid redirects by using /
  return api("/users/", { method: "POST", body: payload });
}

export function createHomework(payload) {
  return api("/homework/", { method: "POST", body: payload });
}

export function updateHomework(id, userId, payload) {
  return api(`/homework/${id}?user_id=${userId}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteHomework(id, userId) {
  return api(`/homework/${id}?user_id=${userId}`, { method: "DELETE" });
}
