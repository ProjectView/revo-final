const MB = 1024 * 1024;

export const MAX_IMAGE_SIZE = 5 * MB;
export const MAX_DOCUMENT_SIZE = 25 * MB;

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
const DOCUMENT_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
] as const;

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadValidationError';
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} Mo`;
  return `${(bytes / 1024).toFixed(0)} Ko`;
}

export function validateImageUpload(file: File): void {
  if (!IMAGE_MIME_TYPES.includes(file.type as typeof IMAGE_MIME_TYPES[number])) {
    throw new UploadValidationError(
      `Format non autorisé. Formats acceptés : PNG, JPEG, WebP.`
    );
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new UploadValidationError(
      `Fichier trop volumineux (${formatBytes(file.size)}). Maximum : ${formatBytes(MAX_IMAGE_SIZE)}.`
    );
  }
}

export function validateDocumentUpload(file: File): void {
  if (!DOCUMENT_MIME_TYPES.includes(file.type as typeof DOCUMENT_MIME_TYPES[number])) {
    throw new UploadValidationError(
      `Format non autorisé. Formats acceptés : PDF, PNG, JPEG, WebP.`
    );
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new UploadValidationError(
      `Fichier trop volumineux (${formatBytes(file.size)}). Maximum : ${formatBytes(MAX_DOCUMENT_SIZE)}.`
    );
  }
}

export function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf('.');
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  const ext = lastDot > 0 ? name.slice(lastDot) : '';
  const safeBase = base.replace(/[^a-zA-Z0-9_\-. ]/g, '_').slice(0, 100);
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, '').slice(0, 10);
  return `${safeBase}${safeExt}` || 'file';
}
