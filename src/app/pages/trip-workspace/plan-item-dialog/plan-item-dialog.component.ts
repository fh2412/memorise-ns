import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CrewMember } from '@models/userInterface.model';
import {
  NewPlanItem, PLAN_CATEGORIES, PLAN_ITEM_TYPES, PlanCategory, PlanItem, PlanItemType,
} from '@models/planItem.model';
import { PlanBoardStore } from '../plan-board.store';

export interface PlanItemDialogData { item?: PlanItem; }
type UserId = CrewMember['user_id'];

@Component({
  selector: 'app-plan-item-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatButtonToggleModule, MatIconModule,
  ],
  templateUrl: './plan-item-dialog.component.html',
  styleUrl: './plan-item-dialog.component.scss',
})
export class PlanItemDialogComponent {
  private fb = inject(NonNullableFormBuilder);
  private dialogRef = inject<MatDialogRef<PlanItemDialogComponent, NewPlanItem>>(MatDialogRef);
  private store = inject(PlanBoardStore);
  readonly data = inject<PlanItemDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.item;
  readonly typeMeta = PLAN_ITEM_TYPES;
  readonly categories = PLAN_CATEGORIES;
  readonly types = (Object.keys(PLAN_ITEM_TYPES) as PlanItemType[]).filter(t => PLAN_ITEM_TYPES[t].creatable);
  readonly me = this.store.viewer()?.userId ?? null;

  /** Placeholders have no account and can't be assigned. "Me" first. */
  readonly assignableCrew = computed(() =>
    this.store.crew()
      .filter(m => !m.isPlaceholder)
      .sort((a, b) => Number(b.user_id === this.me) - Number(a.user_id === this.me)));

  private readonly existingUrl = this.data.item?.payload?.['url'];

  readonly form = this.fb.group({
    type: this.fb.control<PlanItemType>(this.data.item?.type ?? 'note'),
    title: [this.data.item?.title ?? '', [Validators.required, Validators.maxLength(200)]],
    description: [this.data.item?.description ?? ''],
    category: this.fb.control<PlanCategory>(this.data.item?.category ?? 'other'),
    url: [typeof this.existingUrl === 'string' ? this.existingUrl : '', Validators.pattern(/^https?:\/\/\S+$/i)],
    due_date: [this.data.item?.due_date ?? ''],
    assignees: this.fb.control<UserId[]>([...(this.data.item?.assignees ?? [])]),
  });

  readonly selectedType = toSignal(this.form.controls.type.valueChanges, {
    initialValue: this.form.controls.type.value,
  });
  readonly assignees = toSignal(this.form.controls.assignees.valueChanges, {
    initialValue: this.form.controls.assignees.value,
  });

  toggleAssignee(id: UserId): void {
    const current = this.form.controls.assignees.value;
    this.form.controls.assignees.setValue(
      current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }

  save(): void {
    const v = this.form.getRawValue();

    if (v.type === 'link' && !v.url.trim()) {
      this.form.controls.url.setErrors({ required: true });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      type: v.type,
      title: v.title.trim(),
      category: v.category,
      description: v.description.trim() || null,
      payload: v.type === 'link' ? { url: v.url.trim() } : null,
      due_date: v.type === 'todo' && v.due_date ? v.due_date : null,
      ...(v.type === 'todo' ? { assignees: v.assignees } : {}),
    });
  }
}