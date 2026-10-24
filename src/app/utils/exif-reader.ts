// ─────────────────────────────────────────────────────────────────────────────
// Minimal, dependency-free EXIF reader for JPEG.
// Reads only: DateTimeOriginal (fallbacks: DateTimeDigitized, DateTime) + GPS position.
// HEIC/PNG/WebP → null (not supported on purpose).
// ─────────────────────────────────────────────────────────────────────────────
import { PhotoMeta } from '@models/photo-metadata.model';

/** EXIF lives in APP1 right after SOI and is max. 64 KB → 128 KB is always enough. */
export const EXIF_READ_BYTES = 128 * 1024;

const MAX_IFD_ENTRIES = 512;
const MIN_YEAR = 1900;

const TAG = {
  DATE_TIME: 0x0132,
  EXIF_IFD: 0x8769,
  GPS_IFD: 0x8825,
  DATE_TIME_ORIGINAL: 0x9003,
  DATE_TIME_DIGITIZED: 0x9004,
  GPS_LAT_REF: 0x0001,
  GPS_LAT: 0x0002,
  GPS_LNG_REF: 0x0003,
  GPS_LNG: 0x0004,
} as const;

const TYPE = { ASCII: 2, SHORT: 3, LONG: 4, RATIONAL: 5, IFD: 13 } as const;

/** Byte size per TIFF field type. */
const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8, 13: 4 };

interface IfdEntry {
  type: number;
  count: number;
  /** Absolute position of the value in the DataView. */
  valueAt: number;
}

type Ifd = Map<number, IfdEntry>;

/** Reads EXIF metadata of a file. Never throws – returns null if nothing usable is found. */
export async function readPhotoMeta(file: File): Promise<PhotoMeta | null> {
  try {
    const buffer = await file.slice(0, EXIF_READ_BYTES).arrayBuffer();
    return parseJpegExif(buffer);
  } catch {
    return null;
  }
}

/** Pure parser – exported for unit tests. */
export function parseJpegExif(buffer: ArrayBuffer): PhotoMeta | null {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null; // not a JPEG

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return null; // corrupt marker stream
    const marker = view.getUint8(offset + 1);
    if (marker === 0xff) {
      offset++; // fill byte
      continue;
    }
    if (marker === 0xda || marker === 0xd9) return null; // start of scan / end of image → no EXIF

    const length = view.getUint16(offset + 2);
    if (length < 2) return null;

    if (marker === 0xe1 && hasExifHeader(view, offset + 4)) {
      return parseTiff(view, offset + 10);
    }
    offset += 2 + length;
  }
  return null;
}

function hasExifHeader(view: DataView, at: number): boolean {
  if (at + 6 > view.byteLength) return false;
  // "Exif\0\0"
  return view.getUint32(at) === 0x45786966 && view.getUint16(at + 4) === 0x0000;
}

function parseTiff(view: DataView, start: number): PhotoMeta | null {
  if (start + 8 > view.byteLength) return null;

  const byteOrder = view.getUint16(start);
  if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) return null;
  const reader = new TiffReader(view, start, byteOrder === 0x4949);
  if (reader.u16(start + 2) !== 42) return null;

  const ifd0 = reader.readIfd(reader.u32(start + 4));
  if (!ifd0) return null;

  const exifIfd = reader.followPointer(ifd0.get(TAG.EXIF_IFD));
  const gpsIfd = reader.followPointer(ifd0.get(TAG.GPS_IFD));

  const rawDate =
    reader.ascii(exifIfd?.get(TAG.DATE_TIME_ORIGINAL)) ??
    reader.ascii(exifIfd?.get(TAG.DATE_TIME_DIGITIZED)) ??
    reader.ascii(ifd0.get(TAG.DATE_TIME));

  const position = gpsIfd ? readGps(reader, gpsIfd) : null;

  return {
    takenAt: normalizeExifDate(rawDate),
    lat: position?.lat ?? null,
    lng: position?.lng ?? null,
  };
}

function readGps(reader: TiffReader, gps: Ifd): { lat: number; lng: number } | null {
  const lat = reader.dms(gps.get(TAG.GPS_LAT));
  const lng = reader.dms(gps.get(TAG.GPS_LNG));
  if (lat === null || lng === null) return null;

  const latRef = reader.ascii(gps.get(TAG.GPS_LAT_REF))?.toUpperCase();
  const lngRef = reader.ascii(gps.get(TAG.GPS_LNG_REF))?.toUpperCase();
  const signedLat = latRef === 'S' ? -lat : lat;
  const signedLng = lngRef === 'W' ? -lng : lng;

  if (Math.abs(signedLat) > 90 || Math.abs(signedLng) > 180) return null;
  if (signedLat === 0 && signedLng === 0) return null; // "Null Island" = no fix

  return { lat: round6(signedLat), lng: round6(signedLng) };
}

/** "2026:06:03 14:05:09" → "2026-06-03T14:05:09" (or null if invalid / zeroed). */
export function normalizeExifDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return null;

  const [, y, mo, d, h, mi, s] = match;
  const year = +y, month = +mo, day = +d;
  if (year < MIN_YEAR || month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (+h > 23 || +mi > 59 || +s > 59) return null;

  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

class TiffReader {
  constructor(
    private readonly view: DataView,
    private readonly start: number,
    private readonly little: boolean,
  ) {}

  u16(at: number): number {
    return this.view.getUint16(at, this.little);
  }

  u32(at: number): number {
    return this.view.getUint32(at, this.little);
  }

  readIfd(relativeOffset: number): Ifd | null {
    const base = this.start + relativeOffset;
    if (relativeOffset < 8 || base + 2 > this.view.byteLength) return null;

    const count = this.u16(base);
    if (count > MAX_IFD_ENTRIES) return null;

    const entries: Ifd = new Map();
    for (let i = 0; i < count; i++) {
      const p = base + 2 + i * 12;
      if (p + 12 > this.view.byteLength) break;

      const tag = this.u16(p);
      const type = this.u16(p + 2);
      const n = this.u32(p + 4);
      const size = (TYPE_SIZE[type] ?? 0) * n;
      if (size === 0) continue;

      const valueAt = size <= 4 ? p + 8 : this.start + this.u32(p + 8);
      if (valueAt + size > this.view.byteLength) continue; // value outside the read range

      entries.set(tag, { type, count: n, valueAt });
    }
    return entries;
  }

  followPointer(entry: IfdEntry | undefined): Ifd | null {
    if (!entry) return null;
    const offset =
      entry.type === TYPE.LONG || entry.type === TYPE.IFD ? this.u32(entry.valueAt)
      : entry.type === TYPE.SHORT ? this.u16(entry.valueAt)
      : null;
    return offset === null ? null : this.readIfd(offset);
  }

  ascii(entry: IfdEntry | undefined): string | null {
    if (!entry || entry.type !== TYPE.ASCII) return null;
    let result = '';
    for (let i = 0; i < entry.count; i++) {
      const byte = this.view.getUint8(entry.valueAt + i);
      if (byte === 0) break;
      result += String.fromCharCode(byte);
    }
    return result.trim() || null;
  }

  /** Degrees/minutes/seconds (3 RATIONALs) → decimal degrees. */
  dms(entry: IfdEntry | undefined): number | null {
    if (!entry || entry.type !== TYPE.RATIONAL || entry.count < 1) return null;
    const parts = [0, 1, 2].map(i => (i < entry.count ? this.rational(entry.valueAt + i * 8) : 0));
    if (parts.some(v => !Number.isFinite(v))) return null;
    return parts[0] + parts[1] / 60 + parts[2] / 3600;
  }

  private rational(at: number): number {
    const denominator = this.u32(at + 4);
    return denominator === 0 ? NaN : this.u32(at) / denominator;
  }
}
