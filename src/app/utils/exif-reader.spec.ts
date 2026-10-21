import { normalizeExifDate, parseJpegExif } from './exif-reader';

// ── Tiny JPEG/EXIF builder for tests ─────────────────────────────────────────

interface TestExif {
  little?: boolean;
  dateTimeOriginal?: string;
  dateTime?: string;
  gps?: { lat: [number, number, number]; latRef: 'N' | 'S'; lng: [number, number, number]; lngRef: 'E' | 'W' };
}

function buildJpeg(exif: TestExif | null): ArrayBuffer {
  const bytes: number[] = [0xff, 0xd8];
  if (exif) {
    const tiff = buildTiff(exif);
    const length = 2 + 6 + tiff.length;
    bytes.push(0xff, 0xe1, length >> 8, length & 0xff, 0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff);
  }
  bytes.push(0xff, 0xda, 0x00, 0x02, 0xff, 0xd9);
  return new Uint8Array(bytes).buffer;
}

/** Builds IFD0 (+ DateTime) → ExifIFD (DateTimeOriginal) and GPS IFD. */
function buildTiff(exif: TestExif): number[] {
  const little = exif.little ?? true;
  const out: number[] = [];
  const u16 = (v: number) => (little ? [v & 0xff, v >> 8] : [v >> 8, v & 0xff]);
  const u32 = (v: number) =>
    little ? [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, v >>> 24] : [v >>> 24, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
  const ascii = (s: string) => [...s].map(c => c.charCodeAt(0)).concat(0);

  // Layout: header(8) | IFD0 | ExifIFD | GPS IFD | data area
  type Entry = { tag: number; type: number; count: number; data: number[] };
  const ifd0: Entry[] = [];
  const exifIfd: Entry[] = [];
  const gpsIfd: Entry[] = [];

  if (exif.dateTime) ifd0.push({ tag: 0x0132, type: 2, count: exif.dateTime.length + 1, data: ascii(exif.dateTime) });
  if (exif.dateTimeOriginal) {
    exifIfd.push({ tag: 0x9003, type: 2, count: exif.dateTimeOriginal.length + 1, data: ascii(exif.dateTimeOriginal) });
  }
  if (exif.gps) {
    const rationals = (v: [number, number, number]) => v.flatMap(x => [...u32(Math.round(x * 100)), ...u32(100)]);
    gpsIfd.push({ tag: 1, type: 2, count: 2, data: ascii(exif.gps.latRef) });
    gpsIfd.push({ tag: 2, type: 5, count: 3, data: rationals(exif.gps.lat) });
    gpsIfd.push({ tag: 3, type: 2, count: 2, data: ascii(exif.gps.lngRef) });
    gpsIfd.push({ tag: 4, type: 5, count: 3, data: rationals(exif.gps.lng) });
  }

  const ifdSize = (n: number) => 2 + n * 12 + 4;
  const ifd0Count = ifd0.length + (exifIfd.length ? 1 : 0) + (gpsIfd.length ? 1 : 0);
  const ifd0Offset = 8;
  const exifOffset = ifd0Offset + ifdSize(ifd0Count);
  const gpsOffset = exifOffset + (exifIfd.length ? ifdSize(exifIfd.length) : 0);
  let dataOffset = gpsOffset + (gpsIfd.length ? ifdSize(gpsIfd.length) : 0);
  const data: number[] = [];

  const writeIfd = (entries: Entry[]) => {
    out.push(...u16(entries.length));
    for (const e of entries.sort((a, b) => a.tag - b.tag)) {
      out.push(...u16(e.tag), ...u16(e.type), ...u32(e.count));
      if (e.data.length <= 4) {
        out.push(...e.data, ...Array(4 - e.data.length).fill(0));
      } else {
        out.push(...u32(dataOffset));
        data.push(...e.data);
        dataOffset += e.data.length;
      }
    }
    out.push(...u32(0));
  };

  if (exifIfd.length) ifd0.push({ tag: 0x8769, type: 4, count: 1, data: u32(exifOffset) });
  if (gpsIfd.length) ifd0.push({ tag: 0x8825, type: 4, count: 1, data: u32(gpsOffset) });

  out.push(...(little ? [0x49, 0x49] : [0x4d, 0x4d]), ...u16(42), ...u32(ifd0Offset));
  writeIfd(ifd0);
  if (exifIfd.length) writeIfd(exifIfd);
  if (gpsIfd.length) writeIfd(gpsIfd);
  return [...out, ...data];
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('parseJpegExif', () => {
  const salzburg = {
    lat: [47, 48, 0] as [number, number, number],
    latRef: 'N' as const,
    lng: [13, 2, 24] as [number, number, number],
    lngRef: 'E' as const,
  };

  it('reads date and GPS (little endian)', () => {
    const meta = parseJpegExif(buildJpeg({ dateTimeOriginal: '2026:06:03 14:05:09', gps: salzburg }));
    expect(meta).toEqual({ takenAt: '2026-06-03T14:05:09', lat: 47.8, lng: 13.04 });
  });

  it('reads big endian files', () => {
    const meta = parseJpegExif(buildJpeg({ little: false, dateTimeOriginal: '2025:12:31 23:59:59', gps: salzburg }));
    expect(meta).toEqual({ takenAt: '2025-12-31T23:59:59', lat: 47.8, lng: 13.04 });
  });

  it('applies S/W references', () => {
    const meta = parseJpegExif(buildJpeg({ gps: { lat: [33, 52, 0], latRef: 'S', lng: [151, 12, 0], lngRef: 'W' } }));
    expect(meta?.lat).toBeCloseTo(-33.866667, 5);
    expect(meta?.lng).toBeCloseTo(-151.2, 5);
  });

  it('falls back to IFD0 DateTime', () => {
    expect(parseJpegExif(buildJpeg({ dateTime: '2024:02:29 08:00:00' }))?.takenAt).toBe('2024-02-29T08:00:00');
  });

  it('ignores 0/0 GPS positions', () => {
    const meta = parseJpegExif(buildJpeg({ gps: { lat: [0, 0, 0], latRef: 'N', lng: [0, 0, 0], lngRef: 'E' } }));
    expect(meta?.lat).toBeNull();
    expect(meta?.lng).toBeNull();
  });

  it('returns null for JPEGs without EXIF and for non-JPEGs', () => {
    expect(parseJpegExif(buildJpeg(null))).toBeNull();
    expect(parseJpegExif(new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer)).toBeNull();
    expect(parseJpegExif(new ArrayBuffer(0))).toBeNull();
  });

  it('survives truncated data', () => {
    const full = new Uint8Array(buildJpeg({ dateTimeOriginal: '2026:06:03 14:05:09', gps: salzburg }));
    for (let length = 0; length < full.length; length += 7) {
      expect(() => parseJpegExif(full.slice(0, length).buffer)).not.toThrow();
    }
  });
});

describe('normalizeExifDate', () => {
  it('rejects zeroed and invalid dates', () => {
    expect(normalizeExifDate('0000:00:00 00:00:00')).toBeNull();
    expect(normalizeExifDate('2026:13:01 00:00:00')).toBeNull();
    expect(normalizeExifDate('garbage')).toBeNull();
    expect(normalizeExifDate(null)).toBeNull();
  });
});
