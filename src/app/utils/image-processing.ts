// Dependency-free image helpers. The ORIGINAL file is never modified –
// we only read its dimensions and render a small JPEG thumbnail.

export const THUMBNAIL_MAX_EDGE = 640;
export const THUMBNAIL_QUALITY = 0.82;

export class UnsupportedImageError extends Error {
  constructor(fileName: string) {
    super(`Unsupported or corrupt image: ${fileName}`);
    this.name = 'UnsupportedImageError';
  }
}

export interface ProcessedImage {
  /** Orientation-corrected dimensions of the original. */
  width: number;
  height: number;
  thumbnail: Blob;
}

/**
 * Decodes the image once, reads its dimensions and renders a thumbnail.
 * Modern browsers apply EXIF orientation automatically (naturalWidth/Height and drawImage).
 * Throws UnsupportedImageError if the browser cannot decode the format (e.g. HEIC in Chrome).
 */
export async function processImage(file: File, maxEdge = THUMBNAIL_MAX_EDGE): Promise<ProcessedImage> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = 'async';

  try {
    img.src = url;
    try {
      await img.decode();
    } catch {
      throw new UnsupportedImageError(file.name);
    }

    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) throw new UnsupportedImageError(file.name);

    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const thumbnail = await renderJpeg(
      img,
      Math.max(1, Math.round(width * scale)),
      Math.max(1, Math.round(height * scale)),
    );

    return { width, height, thumbnail };
  } finally {
    img.removeAttribute('src');
    URL.revokeObjectURL(url);
  }
}

function renderJpeg(source: HTMLImageElement, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas 2D context unavailable'));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // JPEG has no alpha channel – paint white so transparent PNGs don't turn black
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        // free canvas memory early (important on mobile)
        canvas.width = 0;
        canvas.height = 0;
        if (blob) resolve(blob);
        else reject(new Error('Thumbnail encoding failed'));
      },
      'image/jpeg',
      THUMBNAIL_QUALITY,
    );
  });
}

// ── File helpers ─────────────────────────────────────────────────────────────

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',
};

const EXTENSION_BY_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(MIME_BY_EXTENSION).map(([ext, mime]) => [mime, ext]),
);

/** Cheap pre-check before decoding. HEIC files often have an empty `type`. */
export function isPotentialImage(file: File): boolean {
  if (file.type === 'image/svg+xml') return false;
  return file.type.startsWith('image/') || /\.(heic|heif|avif)$/i.test(file.name);
}

/** Normalised file extension used for the Storage path (keeps the real format). */
export function fileExtension(file: File): string {
  const fromName = /\.([a-z0-9]+)$/i.exec(file.name)?.[1]?.toLowerCase();
  const normalised = fromName === 'jpeg' ? 'jpg' : fromName;
  if (normalised && normalised in MIME_BY_EXTENSION) return normalised;
  return EXTENSION_BY_MIME[file.type] ?? 'jpg';
}

export function mimeType(file: File): string {
  return file.type || MIME_BY_EXTENSION[fileExtension(file)] || 'application/octet-stream';
}

/** Identity used to detect the same file being selected twice. */
export function fileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}
