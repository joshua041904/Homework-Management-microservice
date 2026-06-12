export class ApiError extends Error {
  constructor({ status, detail, body, statusText }) {
    const message = detail || body?.trim() || statusText || `Request failed (HTTP ${status})`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.body = body ?? "";
    this.statusText = statusText;
  }
}

export function parseApiErrorBody(text) {
  if (!text?.trim()) return null;

  try {
    const json = JSON.parse(text);
    const { detail } = json;

    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || JSON.stringify(item))
        .filter(Boolean)
        .join("; ");
    }
    if (detail && typeof detail === "object") {
      return JSON.stringify(detail);
    }
  } catch {
    return text.trim();
  }

  return null;
}

function isGatewayUnreachable(error) {
  if (error instanceof TypeError) return true;

  if (error instanceof ApiError) {
    const emptyBody = !error.body?.trim();
    return error.status === 500 && emptyBody;
  }

  return false;
}

export function formatGatewayMessage() {
  return "Cannot reach API gateway. Is Docker running on port 8080?";
}

export function formatListError(error, userId = 1) {
  if (isGatewayUnreachable(error)) return formatGatewayMessage();

  if (error instanceof ApiError && error.status === 404) {
    const detail = (error.detail || error.message || "").toLowerCase();
    if (detail.includes("user not found")) {
      return `User not found. Create user ${userId} via the README seed command.`;
    }
  }

  if (error instanceof ApiError) {
    if (error.detail) return error.detail;
    if (error.body?.trim()) return error.body.trim();
    return error.statusText || `Request failed (HTTP ${error.status})`;
  }

  return String(error?.message || error);
}

export function formatApiError(error) {
  if (isGatewayUnreachable(error)) return formatGatewayMessage();

  if (error instanceof ApiError) {
    if (error.detail) return error.detail;
    if (error.body?.trim()) return error.body.trim();
    return error.statusText || `Request failed (HTTP ${error.status})`;
  }

  return String(error?.message || error);
}
