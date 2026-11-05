// @models/planBooking.model.ts
import { PlanLocation } from '@models/memoryInterface.model';

export type BookingKind = 'stay' | 'transport' | 'activity';
export type BookingStatus = 'option' | 'booked' | 'cancelled';
export type TransportMode = 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';

// ---------- link previews ----------

export interface LinkPreview {
  url: string;
  final_url: string | null;
  title: string | null;
  description: string | null;
  image_url: string | null;
  site_name: string | null;
  price_cents: number | null;
  price_currency: string | null;
  fetched_at: string | null;
}

/** Stored in plan_items.payload for link items and bookings. */
export interface LinkPayload {
  url: string;
  preview: LinkPreview | null;
}

export interface LinkPreviewResponse {
  preview: LinkPreview | null;
  error: string | null;   // e.g. FETCH_FAILED, NOT_HTML – not a failure, just no preview
  cached: boolean;
}

// ---------- bookings ----------

export interface BookingData {
  kind: BookingKind;
  status: BookingStatus;
  provider: string | null;
  confirmation_code: string | null;
  starts_at: string | null;      // local "YYYY-MM-DDTHH:mm"
  start_tz: string | null;       // IANA, e.g. Europe/Rome
  ends_at: string | null;
  end_tz: string | null;
  starts_at_utc: string | null;  // ISO UTC
  ends_at_utc: string | null;
  transport_mode: TransportMode | null;
  origin: string | null;
  destination: string | null;
  carrier: string | null;
  transport_number: string | null;
  address: string | null;
  location: PlanLocation | null;
  price_cents: number | null;
  currency: string;
  paid_by: string | null;
  notes: string | null;
  source_poll_id: number | null;
}

/** Body for PATCH (all optional) – null clears a field. */
export interface BookingInput {
  title?: string;
  status?: BookingStatus;
  provider?: string | null;
  url?: string | null;
  confirmationCode?: string | null;
  startsAt?: string | null;
  startTz?: string | null;
  endsAt?: string | null;
  endTz?: string | null;
  transportMode?: TransportMode | null;
  origin?: string | null;
  destination?: string | null;
  carrier?: string | null;
  transportNumber?: string | null;
  address?: string | null;
  location?: PlanLocation | null;
  priceCents?: number | null;
  currency?: string;
  paidBy?: string | null;
  notes?: string | null;
}

export interface NewBooking extends BookingInput {
  kind: BookingKind;
  title: string;
  sourcePollId?: number;
  board_x?: number;
  board_y?: number;
  color?: string | null;
}

// ---------- UI metadata ----------

export const BOOKING_KINDS: { key: BookingKind; label: string; icon: string }[] = [
  { key: 'stay',      label: 'Stay',      icon: 'hotel' },
  { key: 'transport', label: 'Transport', icon: 'commute' },
  { key: 'activity',  label: 'Activity',  icon: 'local_activity' },
];
export const BOOKING_KIND_META = Object.fromEntries(BOOKING_KINDS.map(k => [k.key, k])) as
  Record<BookingKind, { key: BookingKind; label: string; icon: string }>;

export const BOOKING_STATUSES: { key: BookingStatus; label: string; icon: string }[] = [
  { key: 'option',    label: 'Option',    icon: 'bookmark_border' },
  { key: 'booked',    label: 'Booked',    icon: 'verified' },
  { key: 'cancelled', label: 'Cancelled', icon: 'cancel' },
];
export const BOOKING_STATUS_META = Object.fromEntries(BOOKING_STATUSES.map(s => [s.key, s])) as
  Record<BookingStatus, { key: BookingStatus; label: string; icon: string }>;

export const TRANSPORT_MODES: { key: TransportMode; label: string; icon: string }[] = [
  { key: 'flight', label: 'Flight', icon: 'flight' },
  { key: 'train',  label: 'Train',  icon: 'train' },
  { key: 'bus',    label: 'Bus',    icon: 'directions_bus' },
  { key: 'car',    label: 'Car',    icon: 'directions_car' },
  { key: 'ferry',  label: 'Ferry',  icon: 'directions_boat' },
  { key: 'other',  label: 'Other',  icon: 'commute' },
];
export const TRANSPORT_MODE_META = Object.fromEntries(TRANSPORT_MODES.map(m => [m.key, m])) as
  Record<TransportMode, { key: TransportMode; label: string; icon: string }>;

/** All with 2 decimals (price is stored in cents). */
export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CZK', 'HUF', 'PLN', 'SEK', 'NOK', 'DKK', 'RON', 'TRY', 'AUD', 'CAD'];
