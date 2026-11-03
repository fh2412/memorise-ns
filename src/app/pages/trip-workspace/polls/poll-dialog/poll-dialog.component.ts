import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlanLocation } from '@models/memoryInterface.model';
import {
  NewPoll, POLL_CATEGORIES, PollCategory, PollOption, PollSettingsPatch,
} from '@models/planItem.model';
import { PlanBoardStore } from '../../plan-board.store';
import { formatLocation, pickLocation } from '../location-utils';

export interface PollDraft {
  title?: string;
  description?: string | null;
  category?: PollCategory;
  options?: string[];
  sourceItemId?: number;
}

export type PollDialogData =
  | { mode: 'create'; draft?: PollDraft }
  | { mode: 'edit'; itemId: number };

type ClosePreset = 'keep' | 'none' | '1h' | '1d' | '3d' | '1w' | 'custom';
interface OptionDraft { key: number; label: string; location: PlanLocation | null; }

const PRESET_MS: Record<'1h' | '1d' | '3d' | '1w', number> = {
  '1h': 3_600_000, '1d': 86_400_000, '3d': 3 * 86_400_000, '1w': 7 * 86_400_000,
};
const MAX_OPTIONS = 20;
const INVALID = Symbol('invalid');

/** undefined = keep, null = no deadline, string = ISO UTC. */
function resolveClosesAt(preset: ClosePreset, custom: string): string | null | undefined | typeof INVALID {
  if (preset === 'keep') return undefined;
  if (preset === 'none') return null;
  if (preset === 'custom') {
    const t = Date.parse(custom); // 'YYYY-MM-DDTHH:mm' is parsed as local time
    return Number.isNaN(t) || t <= Date.now() + 60_000 ? INVALID : new Date(t).toISOString();
  }
  return new Date(Date.now() + PRESET_MS[preset]).toISOString();
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-poll-dialog',
  imports: [
    DatePipe, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatButtonModule, MatIconModule, MatTooltipModule,
  ],
  templateUrl: './poll-dialog.component.html',
  styleUrl: './poll-dialog.component.scss',
})
export class PollDialogComponent {
  readonly data = inject<PollDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<PollDialogComponent, NewPoll>>(MatDialogRef);
  private dialog = inject(MatDialog);
  private fb = inject(NonNullableFormBuilder);
  readonly store = inject(PlanBoardStore);

  readonly categories = POLL_CATEGORIES;
  readonly formatLocation = formatLocation;
  readonly minCustom = toLocalInput(new Date());

  private readonly editId = this.data.mode === 'edit' ? this.data.itemId : null;
  private readonly draft: PollDraft = this.data.mode === 'create' ? this.data.draft ?? {} : {};
  readonly isEdit = this.editId !== null;

  readonly item = computed(() =>
    this.editId === null ? null : this.store.items().find(i => i.item_id === this.editId) ?? null);
  readonly poll = computed(() => this.item()?.poll ?? null);
  private readonly initial = this.item(); // snapshot for the form

  readonly canManage = computed(() => {
    const i = this.item();
    return !i || this.store.canManagePoll()(i);
  });
  readonly isDecided = computed(() => this.poll()?.decided_option_id != null);
  readonly settingsLocked = this.isEdit && (!this.canManage() || this.isDecided());

  readonly form = this.fb.group({
    title: [this.initial?.title ?? this.draft.title ?? '', [Validators.required, Validators.maxLength(200)]],
    description: [this.initial?.description ?? this.draft.description ?? ''],
    category: this.fb.control<PollCategory>(
      (this.initial?.category as PollCategory | undefined) ?? this.draft.category ?? 'other'),
    multiple: [this.initial?.poll?.multiple ?? false],
    maxChoices: this.fb.control<number | null>(this.initial?.poll?.max_choices ?? null),
    allowMemberOptions: [this.initial?.poll?.allow_member_options ?? false],
    hideResults: [this.initial?.poll?.hide_results ?? false],
    closesPreset: this.fb.control<ClosePreset>(this.isEdit ? 'keep' : '3d'),
    closesCustom: [''],
  });

  readonly category = toSignal(this.form.controls.category.valueChanges, { initialValue: this.form.controls.category.value });
  readonly multiple = toSignal(this.form.controls.multiple.valueChanges, { initialValue: this.form.controls.multiple.value });
  readonly preset = toSignal(this.form.controls.closesPreset.valueChanges, { initialValue: this.form.controls.closesPreset.value });
  readonly isDestination = computed(() => this.category() === 'destination');

  // create mode
  private nextKey = 0;
  readonly drafts = signal<OptionDraft[]>(this.initialDrafts());

  // edit mode
  readonly newOption = signal('');
  readonly confirmDelete = signal<number | null>(null);
  readonly canAddOption = computed(() => {
    const p = this.poll();
    return !!p && !this.isDecided() && !p.is_closed && p.options.length < MAX_OPTIONS
      && (p.allow_member_options || this.canManage());
  });

  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  constructor() {
    if (this.isEdit) {
      const c = this.form.controls;
      c.category.disable();
      c.multiple.disable();
      c.maxChoices.disable();
      if (this.settingsLocked) {
        c.closesPreset.disable();
        c.allowMemberOptions.disable();
        c.hideResults.disable();
      }
    }
  }

  // ---------- create: option drafts ----------

  private initialDrafts(): OptionDraft[] {
    const labels = [...(this.draft.options ?? [])];
    while (labels.length < 2) labels.push('');
    return labels.map(label => ({ key: this.nextKey++, label, location: null }));
  }

  addDraft(): void {
    if (this.drafts().length >= MAX_OPTIONS) return;
    this.drafts.update(list => [...list, { key: this.nextKey++, label: '', location: null }]);
  }

  removeDraft(key: number): void {
    this.drafts.update(list => list.filter(d => d.key !== key));
  }

  setDraftLabel(key: number, label: string): void {
    this.drafts.update(list => list.map(d => (d.key === key ? { ...d, label } : d)));
  }

  async pinDraft(key: number): Promise<void> {
    const current = this.drafts().find(d => d.key === key);
    const loc = await pickLocation(this.dialog, current?.location ?? this.store.destination());
    if (loc) this.drafts.update(list => list.map(d => (d.key === key ? { ...d, location: loc } : d)));
  }

  // ---------- edit: live option changes ----------

  canEditOption(o: PollOption): boolean {
    return this.canManage() || o.created_by === this.store.viewer()?.userId;
  }

  async renameOption(o: PollOption, input: HTMLInputElement): Promise<void> {
    const label = input.value.trim();
    if (!label || label === o.label) {
      input.value = o.label;
      return;
    }
    const saved = await this.store.updatePollOption(this.editId!, o.option_id, { label });
    if (!saved) input.value = o.label;
  }

  async removeOption(o: PollOption): Promise<void> {
    if (this.confirmDelete() !== o.option_id) {
      this.confirmDelete.set(o.option_id);
      return;
    }
    this.confirmDelete.set(null);
    await this.store.deletePollOption(this.editId!, o.option_id);
  }

  async pinOption(o: PollOption): Promise<void> {
    const loc = await pickLocation(this.dialog, o.location ?? this.store.destination());
    if (loc) await this.store.updatePollOption(this.editId!, o.option_id, { location: loc });
  }

  async addOption(): Promise<void> {
    const label = this.newOption().trim();
    if (!label) return;
    if (await this.store.addPollOption(this.editId!, { label })) this.newOption.set('');
  }

  // ---------- save ----------

  async save(): Promise<void> {
    this.formError.set(null);
    if (this.form.controls.title.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const closes = resolveClosesAt(v.closesPreset, v.closesCustom);
    if (closes === INVALID) {
      this.formError.set('Please pick a closing time in the future.');
      return;
    }
    if (this.isEdit) await this.saveEdit(v, closes);
    else this.saveCreate(v, closes);
  }

  private saveCreate(v: ReturnType<typeof this.form.getRawValue>, closes: string | null | undefined): void {
    const options = this.drafts()
      .map(d => ({ label: d.label.trim(), location: v.category === 'destination' ? d.location : null }))
      .filter(o => o.label);

    const min = v.allowMemberOptions ? 1 : 2;
    if (options.length < min) {
      this.formError.set(min === 2 ? 'Add at least two options.' : 'Add at least one option.');
      return;
    }
    if (new Set(options.map(o => o.label.toLocaleLowerCase())).size !== options.length) {
      this.formError.set('Options must be unique.');
      return;
    }
    if (v.multiple && v.maxChoices != null && (v.maxChoices < 2 || v.maxChoices > MAX_OPTIONS)) {
      this.formError.set(`Max. choices must be between 2 and ${MAX_OPTIONS}, or empty.`);
      return;
    }

    this.dialogRef.close({
      title: v.title.trim(),
      description: v.description.trim() || null,
      category: v.category,
      options,
      multiple: v.multiple,
      maxChoices: v.multiple ? v.maxChoices || null : null,
      closesAt: closes ?? null,
      allowMemberOptions: v.allowMemberOptions,
      hideResults: v.hideResults,
      ...(this.draft.sourceItemId ? { sourceItemId: this.draft.sourceItemId } : {}),
    });
  }

  private async saveEdit(v: ReturnType<typeof this.form.getRawValue>, closes: string | null | undefined): Promise<void> {
    const item = this.item();
    if (!item) {
      this.dialogRef.close();
      return;
    }
    this.saving.set(true);

    const title = v.title.trim();
    const description = v.description.trim() || null;
    if (title !== item.title || description !== (item.description ?? null)) {
      await this.store.update(item.item_id, { title, description });
    }

    if (!this.settingsLocked && item.poll) {
      const patch: PollSettingsPatch = {};
      if (closes !== undefined) patch.closesAt = closes;
      if (v.allowMemberOptions !== item.poll.allow_member_options) patch.allowMemberOptions = v.allowMemberOptions;
      if (v.hideResults !== item.poll.hide_results) patch.hideResults = v.hideResults;
      if (Object.keys(patch).length) await this.store.updatePollSettings(item.item_id, patch);
    }

    this.saving.set(false);
    this.dialogRef.close();
  }
}