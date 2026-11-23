// trip-workspace/destination/destination-dialog/destination-dialog.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlanLocation } from '@models/memoryInterface.model';
import { PlanBoardStore } from '../../plan-board.store';
import { formatLocation, pickLocation } from '../../polls/location-utils';

const MAX_LABEL = 200;

/**
 * Set / change / remove the plan's destination (owner only).
 * A name alone is enough; the map pin can be added now or later.
 */
@Component({
  selector: 'app-destination-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './destination-dialog.component.html',
  styleUrl: './destination-dialog.component.scss',
})
export class DestinationDialogComponent {
  private store = inject(PlanBoardStore);
  private dialog = inject(MatDialog);
  private dialogRef = inject<MatDialogRef<DestinationDialogComponent, boolean>>(MatDialogRef);

  readonly maxLabel = MAX_LABEL;
  readonly formatLocation = formatLocation;

  private readonly current = this.store.destinationInfo();
  readonly isEdit = !!this.current;
  readonly fromPoll = this.current?.source_poll_id != null;

  readonly label = signal(this.current?.label ?? '');
  readonly location = signal<PlanLocation | null>(this.current?.location ?? null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly confirmRemove = signal(false);

  readonly pinLabel = computed(() => formatLocation(this.location()));
  readonly labelChanged = computed(() => this.label().trim() !== (this.current?.label ?? ''));

  async pick(): Promise<void> {
    const loc = await pickLocation(this.dialog, this.location() ?? this.current?.location ?? null);
    if (!loc) return;
    this.location.set(loc);
    if (!this.label().trim()) this.label.set((loc.city || loc.country || '').slice(0, MAX_LABEL));
  }

  removePin(): void {
    this.location.set(null);
  }

  async save(): Promise<void> {
    const label = this.label().trim();
    if (!label) {
      this.error.set('Please give the destination a name, e.g. "Lake Garda" or "Somewhere in Tuscany".');
      return;
    }
    this.error.set(null);
    this.saving.set(true);
    const ok = await this.store.setDestination(label, this.location());
    console.log("OK: ", ok);
    this.saving.set(false);
    if (ok) this.dialogRef.close(true);
  }

  /** First click arms, second click removes. */
  async remove(): Promise<void> {
    if (!this.confirmRemove()) {
      this.confirmRemove.set(true);
      return;
    }
    this.saving.set(true);
    const ok = await this.store.removeDestination();
    this.saving.set(false);
    if (ok) this.dialogRef.close(true);
  }
}
