// pages/live-memory/expenses/expense.store.ts
import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { PlanExpenseService } from '@services/plan-expense.service';
import { CurrencyInput, Expense, ExpenseInput, Ledger, LedgerParticipant } from '@models/livePlan.model';
import { apiMessage, PlanBoardStore } from '../../trip-workspace/plan-board.store';

const REFRESH_ACTION = /^(expense_|currency_updated$)/;

export interface BalanceRow { participant: LedgerParticipant; net: number; isMe: boolean; }

/**
 * Component-level store for the expense ledger of one memory.
 * Balances always come from the server (every write returns the full ledger).
 * Other people's changes arrive via PlanBoardStore.remoteEvents (polling).
 */
@Injectable()
export class ExpenseStore {
  private api = inject(PlanExpenseService);
  private board = inject(PlanBoardStore);
  private memoryId = '';
  private token = 0;

  readonly ledger = signal<Ledger | null>(null);
  readonly isLoading = signal(false);
  private readonly loaded = signal(false);

  readonly participants = computed(() => this.ledger()?.participants ?? []);
  readonly currentParticipants = computed(() => this.participants().filter(p => p.isCurrent));
  readonly byKey = computed(() => new Map(this.participants().map(p => [p.key, p])));
  readonly viewerKey = computed(() => this.ledger()?.viewer.key ?? null);
  readonly isOwner = computed(() => this.ledger()?.viewer.isOwner ?? false);
  readonly base = computed(() => this.ledger()?.currency.base ?? 'EUR');
  readonly expenses = computed(() => this.ledger()?.expenses ?? []);
  readonly suggestions = computed(() => this.ledger()?.bookingSuggestions ?? []);
  readonly missingRates = computed(() => this.ledger()?.balances.missingRates ?? []);
  readonly usedCurrencies = computed(() => Object.keys(this.ledger()?.balances.totals ?? {}));

  /** My net in the base currency; null while a rate is missing. */
  readonly myNet = computed(() => {
    const l = this.ledger();
    if (!l?.balances.converted) return null;
    return l.balances.converted[l.viewer.key] ?? 0;
  });

  readonly balanceRows = computed<BalanceRow[]>(() => {
    const l = this.ledger();
    const converted = l?.balances.converted;
    if (!l || !converted) return [];
    return this.participants()
      .filter(p => p.isCurrent || (converted[p.key] ?? 0) !== 0)
      .map(p => ({ participant: p, net: converted[p.key] ?? 0, isMe: p.key === l.viewer.key }))
      .sort((a, b) => b.net - a.net);
  });

  constructor() {
    effect(() => {
      const events = this.board.remoteEvents();
      if (!untracked(this.loaded)) return;
      if (events.some(e => REFRESH_ACTION.test(e.action))) untracked(() => void this.refresh());
    });
  }

  async load(memoryId: string): Promise<void> {
    this.memoryId = memoryId;
    this.isLoading.set(true);
    try {
      this.ledger.set(await firstValueFrom(this.api.getLedger(memoryId)));
      this.loaded.set(true);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      this.board.error.set('Could not load expenses');
    } finally {
      this.isLoading.set(false);
    }
  }

  async refresh(): Promise<void> {
    const token = ++this.token;
    try {
      const ledger = await firstValueFrom(this.api.getLedger(this.memoryId));
      if (token === this.token) this.ledger.set(ledger);
    } catch (err) {
      console.warn('Expense refresh failed:', err);
    }
  }

  /** Mirror of the backend rule: creator, payer or plan owner. */
  canEdit(e: Expense): boolean {
    const l = this.ledger();
    return !!l && (l.viewer.isOwner || e.created_by === l.viewer.userId || e.paid_by === l.viewer.key);
  }

  // ---------- writes used by the dialog: they throw, the dialog shows the message inline ----------

  create(input: ExpenseInput): Promise<void> {
    return this.write(() => this.api.create(this.memoryId, input));
  }

  update(expenseId: number, patch: Partial<ExpenseInput>): Promise<void> {
    return this.write(() => this.api.update(this.memoryId, expenseId, patch));
  }

  // ---------- writes from lists: errors go to the snackbar ----------

  remove(expenseId: number): Promise<boolean> {
    return this.safe('Could not delete the expense', () => this.api.remove(this.memoryId, expenseId));
  }

  fromBooking(itemId: number): Promise<boolean> {
    return this.safe('Could not add the booking as an expense', () => this.api.fromBooking(this.memoryId, itemId));
  }

  setCurrency(input: CurrencyInput): Promise<boolean> {
    return this.safe('Could not save the currency settings', () => this.api.setCurrency(this.memoryId, input));
  }

  private async write(call: () => Observable<Ledger>): Promise<void> {
    ++this.token; // a refresh still in flight must not overwrite the newer result
    this.ledger.set(await firstValueFrom(call()));
    this.board.syncNow(); // own feed entry shows up right away
  }

  private async safe(fallback: string, call: () => Observable<Ledger>): Promise<boolean> {
    try {
      await this.write(call);
      return true;
    } catch (err) {
      console.error(fallback, err);
      this.board.error.set(apiMessage(err, fallback));
      return false;
    }
  }
}
