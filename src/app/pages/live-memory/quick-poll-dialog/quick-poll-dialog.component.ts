// pages/live-memory/quick-poll-dialog/quick-poll-dialog.component.ts
import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NewPoll, POLL_CATEGORIES, PollCategory } from '@models/planItem.model';

type ClosePreset = '15m' | '30m' | '1h' | '3h' | 'none';
const PRESET_MS: Record<Exclude<ClosePreset, 'none'>, number> = {
  '15m': 15 * 60_000, '30m': 30 * 60_000, '1h': 3_600_000, '3h': 3 * 3_600_000,
};
const MAX_OPTIONS = 20;

/** Fast poll for the live view: question, options, short deadline. Same poll item as on the board. */
@Component({
  selector: 'app-quick-poll-dialog',
  imports: [MatDialogModule, MatButtonModule, MatButtonToggleModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './quick-poll-dialog.component.html',
  styleUrl: './quick-poll-dialog.component.scss',
})
export class QuickPollDialogComponent {
  private dialogRef = inject<MatDialogRef<QuickPollDialogComponent, NewPoll>>(MatDialogRef);

  readonly categories = POLL_CATEGORIES;
  readonly presets: { key: ClosePreset; label: string }[] = [
    { key: '15m', label: '15 min' }, { key: '30m', label: '30 min' },
    { key: '1h', label: '1 h' }, { key: '3h', label: '3 h' }, { key: 'none', label: 'Open' },
  ];

  private nextKey = 0;
  readonly question = signal('');
  readonly options = signal([{ key: this.nextKey++, label: '' }, { key: this.nextKey++, label: '' }]);
  readonly closes = signal<ClosePreset>('30m');
  readonly multiple = signal(false);
  readonly category = signal<PollCategory>('activity');
  readonly error = signal<string | null>(null);

  setLabel(key: number, label: string): void {
    this.options.update(list => list.map(o => (o.key === key ? { ...o, label } : o)));
  }

  addOption(): void {
    if (this.options().length >= MAX_OPTIONS) return;
    this.options.update(list => [...list, { key: this.nextKey++, label: '' }]);
  }

  removeOption(key: number): void {
    if (this.options().length <= 2) return;
    this.options.update(list => list.filter(o => o.key !== key));
  }

  create(): void {
    const title = this.question().trim();
    const labels = this.options().map(o => o.label.trim()).filter(Boolean);
    if (!title) {
      this.error.set('Please ask a question.');
      return;
    }
    if (labels.length < 2) {
      this.error.set('Add at least two options.');
      return;
    }
    if (new Set(labels.map(l => l.toLocaleLowerCase())).size !== labels.length) {
      this.error.set('Options must be different.');
      return;
    }
    const preset = this.closes();
    this.dialogRef.close({
      title: title.slice(0, 200),
      category: this.category(),
      options: labels.map(label => ({ label: label.slice(0, 200) })),
      multiple: this.multiple(),
      closesAt: preset === 'none' ? null : new Date(Date.now() + PRESET_MS[preset]).toISOString(),
      allowMemberOptions: true,
      hideResults: false,
    });
  }
}
