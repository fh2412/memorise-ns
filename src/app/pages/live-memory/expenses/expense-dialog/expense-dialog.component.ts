// pages/live-memory/expenses/expense-dialog/expense-dialog.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { CURRENCIES } from '@models/planBooking.model';
import {
  EXPENSE_CATEGORIES, Expense, ExpenseCategory, ExpenseInput, ExpenseSplit, LedgerParticipant, todayIso,
} from '@models/livePlan.model';
import { apiMessage } from '../../../trip-workspace/plan-board.store';
import { parsePriceInput, formatPrice } from '../../../trip-workspace/link-preview/link-utils';
import { ExpenseStore } from '../expense.store';

export type ExpenseDialogData = { mode: 'create' } | { mode: 'edit'; expense: Expense };

@Component({
  selector: 'app-expense-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatIconModule,
  ],
  templateUrl: './expense-dialog.component.html',
  styleUrl: './expense-dialog.component.scss',
})
export class ExpenseDialogComponent {
  readonly data = inject<ExpenseDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<ExpenseDialogComponent, boolean>>(MatDialogRef);
  private fb = inject(NonNullableFormBuilder);
  readonly store = inject(ExpenseStore);

  readonly categories = EXPENSE_CATEGORIES;
  readonly expense: Expense | null = this.data.mode === 'edit' ? this.data.expense : null;
  readonly isEdit = this.expense !== null;
  readonly canDelete = this.expense ? this.store.canEdit(this.expense) : false;
  readonly me = this.store.viewerKey();

  /** Current crew + former members that are already part of this expense. */
  readonly people: LedgerParticipant[] = (() => {
    const e = this.expense;
    const inExpense = new Set(e ? [e.paid_by, ...e.shares.map(s => s.participant)] : []);
    return this.store.participants().filter(p => p.isCurrent || inExpense.has(p.key));
  })();

  readonly currencies = [...new Set([this.store.base(), ...CURRENCIES, ...(this.expense ? [this.expense.currency] : [])])];

  readonly form = this.fb.group({
    title: [this.expense?.title ?? '', [Validators.required, Validators.maxLength(200)]],
    amount: [this.expense ? (this.expense.amount_cents / 100).toFixed(2) : '', Validators.required],
    currency: [this.expense?.currency ?? this.store.base()],
    paidBy: [this.expense?.paid_by ?? this.me ?? ''],
    category: this.fb.control<ExpenseCategory>(this.expense?.category ?? 'food'),
    spentOn: [this.expense?.spent_on ?? todayIso()],
    notes: [this.expense?.notes ?? '', Validators.maxLength(2000)],
  });

  readonly splitMode = signal<'equal' | 'custom'>(this.expense?.split_mode ?? 'equal');
  readonly selected = signal<ReadonlySet<string>>(new Set(
    this.expense?.split_mode === 'equal'
      ? this.expense.shares.map(s => s.participant)
      : this.people.filter(p => p.isCurrent).map(p => p.key),
  ));
  readonly custom = signal<Record<string, string>>(
    this.expense?.split_mode === 'custom'
      ? Object.fromEntries(this.expense.shares.map(s => [s.participant, (s.cents / 100).toFixed(2)]))
      : {},
  );

  private readonly amountValue = toSignal(this.form.controls.amount.valueChanges, { initialValue: this.form.controls.amount.value });
  readonly currencyValue = toSignal(this.form.controls.currency.valueChanges, { initialValue: this.form.controls.currency.value });
  readonly amountCents = computed(() => {
    const c = parsePriceInput(this.amountValue());
    return typeof c === 'number' ? c : null;
  });

  readonly perPerson = computed(() => {
    const amount = this.amountCents();
    const n = this.selected().size;
    return amount && n ? formatPrice(Math.floor(amount / n), this.currencyValue()) : null;
  });

  readonly customRemaining = computed(() => {
    let sum = 0;
    for (const raw of Object.values(this.custom())) {
      const c = parsePriceInput(raw);
      if (typeof c === 'number') sum += c;
    }
    return (this.amountCents() ?? 0) - sum;
  });

  readonly money = formatPrice;
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly confirmDelete = signal(false);

  togglePerson(key: string): void {
    this.selected.update(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  selectAll(all: boolean): void {
    this.selected.set(new Set(all ? this.people.filter(p => p.isCurrent).map(p => p.key) : []));
  }

  setCustom(key: string, value: string): void {
    this.custom.update(prev => ({ ...prev, [key]: value }));
  }

  nameOf(p: LedgerParticipant): string {
    return p.key === this.me ? 'Me' : p.name;
  }

  async save(): Promise<void> {
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const amount = parsePriceInput(v.amount);
    if (typeof amount !== 'number' || amount <= 0) {
      this.formError.set('Please enter an amount above zero, e.g. 24,50.');
      return;
    }
    if (!v.paidBy) {
      this.formError.set('Please choose who paid.');
      return;
    }

    let split: ExpenseSplit;
    if (this.splitMode() === 'equal') {
      const participants = [...this.selected()];
      if (participants.length === 0) {
        this.formError.set('Pick at least one person to split with.');
        return;
      }
      split = { mode: 'equal', participants };
    } else {
      const shares: { participant: string; amountCents: number }[] = [];
      for (const p of this.people) {
        const raw = this.custom()[p.key] ?? '';
        const cents = parsePriceInput(raw);
        if (cents === undefined) {
          this.formError.set(`Please check the amount for ${p.name}.`);
          return;
        }
        if (cents) shares.push({ participant: p.key, amountCents: cents });
      }
      const sum = shares.reduce((acc, s) => acc + s.amountCents, 0);
      if (sum !== amount) {
        this.formError.set(`The shares add up to ${formatPrice(sum, v.currency)} instead of ${formatPrice(amount, v.currency)}.`);
        return;
      }
      split = { mode: 'custom', shares };
    }

    const input: ExpenseInput = {
      title: v.title.trim(),
      category: v.category,
      amountCents: amount,
      currency: v.currency,
      paidBy: v.paidBy,
      spentOn: v.spentOn || todayIso(),
      split,
      notes: v.notes.trim() || null,
    };

    this.saving.set(true);
    try {
      if (this.expense) await this.store.update(this.expense.expense_id, input);
      else await this.store.create(input);
      this.dialogRef.close(true);
    } catch (err) {
      console.error('Failed to save expense:', err);
      this.formError.set(apiMessage(err, 'Could not save the expense'));
    } finally {
      this.saving.set(false);
    }
  }

  /** First click arms, second click deletes. */
  async remove(): Promise<void> {
    if (!this.expense) return;
    if (!this.confirmDelete()) {
      this.confirmDelete.set(true);
      return;
    }
    if (await this.store.remove(this.expense.expense_id)) this.dialogRef.close(true);
  }
}
