// trip-workspace/bookings/booking-dialog/booking-dialog.component.ts
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { PlanLocation } from '@models/memoryInterface.model';
import {
  BOOKING_KINDS, BOOKING_STATUSES, BookingInput, BookingKind, BookingStatus, CURRENCIES,
  LinkPreview, TRANSPORT_MODES, TransportMode,
} from '@models/planBooking.model';
import { apiMessage, PlanBoardStore } from '../../plan-board.store';
import { formatLocation, pickLocation } from '../../polls/location-utils';
import { LinkPreviewFieldComponent } from '../../link-preview/link-preview-field/link-preview-field.component';
import { parsePriceInput, readLinkPayload } from '../../link-preview/link-utils';
import { browserTimeZone, filterTimeZones, isKnownTimeZone, KIND_LABELS } from '../booking-utils';

export interface BookingDraft {
  kind?: BookingKind;
  title?: string;
  location?: PlanLocation | null;
  sourcePollId?: number;
}

export type BookingDialogData =
  | { mode: 'create'; draft?: BookingDraft }
  | { mode: 'edit'; itemId: number };

const nz = (v: string): string | null => (v.trim() ? v.trim() : null);

/**
 * Create / edit a booking. Saves through the store itself and stays open
 * with an inline error if the server rejects the input.
 */
@Component({
  selector: 'app-booking-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatIconModule, LinkPreviewFieldComponent,
  ],
  templateUrl: './booking-dialog.component.html',
  styleUrl: './booking-dialog.component.scss',
})
export class BookingDialogComponent {
  readonly data = inject<BookingDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<BookingDialogComponent, boolean>>(MatDialogRef);
  private dialog = inject(MatDialog);
  private fb = inject(NonNullableFormBuilder);
  readonly store = inject(PlanBoardStore);

  readonly kinds = BOOKING_KINDS;
  readonly statuses = BOOKING_STATUSES;
  readonly transportModes = TRANSPORT_MODES;
  readonly formatLocation = formatLocation;
  readonly memoryId = this.store.currentMemoryId;

  private readonly editId = this.data.mode === 'edit' ? this.data.itemId : null;
  readonly isEdit = this.editId !== null;
  private readonly draft: BookingDraft = this.data.mode === 'create' ? this.data.draft ?? {} : {};
  private readonly item = this.editId === null ? null : this.store.items().find(i => i.item_id === this.editId) ?? null;
  private readonly b = this.item?.booking ?? null;
  private readonly link = readLinkPayload(this.item);
  readonly initialPreview: LinkPreview | null = this.link?.preview ?? null;
  private readonly myTz = browserTimeZone();

  readonly form = this.fb.group({
    kind: this.fb.control<BookingKind>(this.b?.kind ?? this.draft.kind ?? 'stay'),
    title: [this.item?.title ?? this.draft.title ?? '', [Validators.required, Validators.maxLength(200)]],
    status: this.fb.control<BookingStatus>(this.b?.status ?? 'option'),
    url: [this.link?.url ?? '', Validators.pattern(/^https?:\/\/\S+$/i)],
    provider: [this.b?.provider ?? '', Validators.maxLength(200)],
    confirmationCode: [this.b?.confirmation_code ?? '', Validators.maxLength(100)],
    startsAt: [this.b?.starts_at ?? ''],
    startTz: [this.b?.start_tz ?? this.myTz],
    endsAt: [this.b?.ends_at ?? ''],
    endTz: [this.b?.end_tz ?? this.b?.start_tz ?? this.myTz],
    transportMode: this.fb.control<TransportMode | ''>(this.b?.transport_mode ?? ''),
    origin: [this.b?.origin ?? '', Validators.maxLength(200)],
    destination: [this.b?.destination ?? '', Validators.maxLength(200)],
    carrier: [this.b?.carrier ?? '', Validators.maxLength(100)],
    transportNumber: [this.b?.transport_number ?? '', Validators.maxLength(40)],
    address: [this.b?.address ?? '', Validators.maxLength(500)],
    price: [this.b?.price_cents != null ? (this.b.price_cents / 100).toFixed(2) : ''],
    currency: [this.b?.currency ?? 'EUR'],
    paidBy: [this.b?.paid_by ?? ''],
    notes: [this.b?.notes ?? '', Validators.maxLength(5000)],
  });

  readonly location = signal<PlanLocation | null>(this.b?.location ?? this.draft.location ?? null);

  private readonly c = this.form.controls;
  readonly kind = toSignal(this.c.kind.valueChanges, { initialValue: this.c.kind.value });
  readonly urlValue = toSignal(this.c.url.valueChanges, { initialValue: this.c.url.value });
  private readonly startTzValue = toSignal(this.c.startTz.valueChanges, { initialValue: this.c.startTz.value });
  private readonly endTzValue = toSignal(this.c.endTz.valueChanges, { initialValue: this.c.endTz.value });
  private readonly currencyValue = toSignal(this.c.currency.valueChanges, { initialValue: this.c.currency.value });

  readonly labels = computed(() => KIND_LABELS[this.kind()]);
  readonly startTzOptions = computed(() => filterTimeZones(this.startTzValue()));
  readonly endTzOptions = computed(() => filterTimeZones(this.endTzValue()));
  readonly currencyOptions = computed(() => [...new Set([...CURRENCIES, this.currencyValue()].filter(Boolean))]);
  readonly payers = computed(() => this.store.crew().filter(m => !m.isPlaceholder));
  readonly me = this.store.viewer()?.userId ?? null;

  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  private readonly linkField = viewChild(LinkPreviewFieldComponent);

  constructor() {
    if (this.isEdit) {
      this.c.kind.disable(); // the kind is the category – fixed after creation
      if (!this.item?.booking) queueMicrotask(() => this.dialogRef.close(false)); // deleted meanwhile
    }
  }

  // ---------- helpers from the link preview ----------

  onPreview(p: LinkPreview | null): void {
    if (p?.title && !this.c.title.value.trim()) this.c.title.setValue(p.title.slice(0, 200));
  }

  applyPrice(e: { priceCents: number; currency: string }): void {
    this.c.price.setValue((e.priceCents / 100).toFixed(2));
    this.c.currency.setValue(e.currency);
  }

  async pickLocation(): Promise<void> {
    const loc = await pickLocation(this.dialog, this.location() ?? this.store.destination());
    if (loc) this.location.set(loc);
  }

  // ---------- save ----------

  async save(): Promise<void> {
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const isTransport = v.kind === 'transport';

    const priceCents = parsePriceInput(v.price);
    if (priceCents === undefined) {
      this.formError.set('Please enter a valid price, e.g. 480 or 480,50.');
      return;
    }
    if (v.startsAt && !isKnownTimeZone(v.startTz)) {
      this.formError.set('Please pick a time zone from the list.');
      return;
    }
    if (isTransport && v.endsAt && !isKnownTimeZone(v.endTz)) {
      this.formError.set('Please pick an arrival time zone from the list.');
      return;
    }

    const input: BookingInput = {
      title: v.title.trim(),
      status: v.status,
      provider: nz(v.provider),
      confirmationCode: nz(v.confirmationCode),
      startsAt: v.startsAt || null,
      startTz: v.startsAt ? v.startTz : null,
      endsAt: v.endsAt || null,
      endTz: v.endsAt ? (isTransport ? v.endTz : v.startTz) : null,
      priceCents,
      currency: v.currency,
      paidBy: v.paidBy || null,
      notes: nz(v.notes),
      ...(isTransport
        ? {
            transportMode: v.transportMode || null,
            origin: nz(v.origin),
            destination: nz(v.destination),
            carrier: nz(v.carrier),
            transportNumber: nz(v.transportNumber),
          }
        : { address: nz(v.address), location: this.location() }),
    };

    this.saving.set(true);
    try {
      // Make sure the preview is in the server cache before the item is saved
      await this.linkField()?.settle();
      const url = v.url.trim();

      if (this.isEdit) {
        if (url !== (this.link?.url ?? '')) input.url = url || null; // only send a changed link
        await this.store.updateBooking(this.editId!, input);
      } else {
        await this.store.createBooking({
          ...input,
          kind: v.kind,
          title: v.title.trim(),
          ...(url ? { url } : {}),
          ...(this.draft.sourcePollId ? { sourcePollId: this.draft.sourcePollId } : {}),
        });
      }
      this.dialogRef.close(true);
    } catch (err) {
      console.error('Failed to save booking:', err);
      this.formError.set(apiMessage(err, 'Could not save the booking'));
    } finally {
      this.saving.set(false);
    }
  }
}
