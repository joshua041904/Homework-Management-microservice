import os
import re
import uuid
from pathlib import Path

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/data/uploads"))
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".png", ".jpg", ".jpeg", ".txt"}

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "text/plain",
}

EXTENSION_TO_CONTENT_TYPE = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".txt": "text/plain",
}


def ensure_upload_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def resolve_content_type(filename: str, content_type: str | None) -> str:
    ext = Path(filename or "").suffix.lower()
    normalized = (content_type or "").split(";", 1)[0].strip().lower()

    if normalized in ALLOWED_CONTENT_TYPES:
        return normalized

    if ext in EXTENSION_TO_CONTENT_TYPE:
        return EXTENSION_TO_CONTENT_TYPE[ext]

    return normalized


def validate_upload(filename: str, content_type: str | None, size: int) -> str:
    if not filename or not filename.strip():
        raise ValueError("A file must be selected.")

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise ValueError(f"File type not allowed. Allowed types: {allowed}")

    if size <= 0:
        raise ValueError("File is empty.")

    if size > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise ValueError(f"File exceeds the {max_mb} MB size limit.")

    resolved_type = resolve_content_type(filename, content_type)
    if resolved_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("File content type is not allowed.")

    return resolved_type


def save_upload(content: bytes, original_filename: str, content_type: str) -> tuple[str, str, int]:
    ensure_upload_dir()
    storage_name = str(uuid.uuid4())
    path = UPLOAD_DIR / storage_name
    path.write_bytes(content)
    return storage_name, content_type, len(content)


def delete_storage_file(storage_name: str | None) -> None:
    if not storage_name:
        return

    path = UPLOAD_DIR / storage_name
    if path.is_file():
        path.unlink()


def get_storage_path(storage_name: str) -> Path:
    return UPLOAD_DIR / storage_name


def safe_download_filename(original_name: str) -> str:
    cleaned = re.sub(r'[\r\n"]', "", original_name or "").strip()
    cleaned = cleaned.replace("\\", "_").replace("/", "_")
    return cleaned[:200] or "download"
