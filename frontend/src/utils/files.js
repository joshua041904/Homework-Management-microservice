export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".txt",
];

const ALLOWED_EXTENSION_SET = new Set(ALLOWED_FILE_EXTENSIONS);

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateHomeworkFile(file) {
  if (!file) return null;

  const name = file.name || "";
  const ext = name.includes(".")
    ? `.${name.split(".").pop().toLowerCase()}`
    : "";

  if (!ALLOWED_EXTENSION_SET.has(ext)) {
    return `File type not allowed. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(", ")}`;
  }

  if (file.size <= 0) {
    return "File is empty.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File exceeds the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB size limit.`;
  }

  return null;
}

export function allowedFileAccept() {
  return ALLOWED_FILE_EXTENSIONS.join(",");
}
