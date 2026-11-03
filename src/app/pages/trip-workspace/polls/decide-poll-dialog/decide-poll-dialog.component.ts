import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PlanLocation } from '@models/memoryInterface.model';
import { DecidePollBody, PlanItem } from '@models/planItem.model';
import { formatLocation, pickLocation } from '../location-utils';

export interface DecidePollData { item: PlanItem; currentDestination: PlanLocation | null; }
export type DecidePollResult = DecidePollBody;

@Component({
  selector: 'app-decide-poll-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatRadioModule, MatCheckboxModule],
  templateUrl: './decide-poll-dialog.component.html',
  styleUrl: './decide-poll-dialog.component.scss',
})
export class DecidePollDialogComponent {
  readonly data = inject<DecidePollData>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<DecidePollDialogComponent, DecidePollResult>>(MatDialogRef);
  private dialog = inject(MatDialog);
  readonly formatLocation = formatLocation;

  readonly poll = this.data.item.poll!;
  readonly isDestination = this.data.item.category === 'destination';
  readonly ranked = [...this.poll.options]
    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0) || a.sort_order - b.sort_order);
  private readonly topVotes = this.ranked[0]?.votes ?? 0;
  readonly isTie = this.topVotes > 0
    && this.ranked.filter(o => (o.votes ?? 0) === this.topVotes).length > 1;

  /** Tie → nothing preselected, the decider has to choose. */
  readonly selectedId = signal<number | null>(this.isTie ? null : this.ranked[0]?.option_id ?? null);
  readonly picked = signal<PlanLocation | null>(null);
  readonly replaceConfirmed = signal(false);

  readonly selected = computed(() => this.ranked.find(o => o.option_id === this.selectedId()) ?? null);
  readonly location = computed(() => this.picked() ?? this.selected()?.location ?? null);
  readonly needsReplaceConfirm = computed(() =>
    this.isDestination && !!this.data.currentDestination && !!this.location());
  readonly canConfirm = computed(() =>
    !!this.selected() && (!this.needsReplaceConfirm() || this.replaceConfirmed()));

  select(optionId: number): void {
    this.selectedId.set(optionId);
    this.picked.set(null);
  }

  async pick(): Promise<void> {
    const loc = await pickLocation(this.dialog, this.location() ?? this.data.currentDestination);
    if (loc) this.picked.set(loc);
  }

  confirm(): void {
    const s = this.selected();
    if (!s || !this.canConfirm()) return;
    const picked = this.picked();
    this.dialogRef.close(picked ? { optionId: s.option_id, location: picked } : { optionId: s.option_id });
  }
}