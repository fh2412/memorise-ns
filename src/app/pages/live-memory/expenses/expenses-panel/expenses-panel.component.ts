// pages/live-memory/expenses/expenses-panel/expenses-panel.component.ts
import { ChangeDetectionStrategy, Component, computed, inject, Injector, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CURRENCIES, BOOKING_KIND_META } from '@models/planBooking.model';
import { BookingSuggestion, Expense, EXPENSE_CATEGORY_META, todayIso } from '@models/livePlan.model';
import { ExpenseStore } from '../expense.store';
import { balanceText, money, openExpenseDialog, signedMoney } from '../expense-utils';

const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

@Component({
  selector: 'app-expenses-panel',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './expenses-panel.component.html',
  styleUrl: './expenses-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesPanelComponent {
  readonly store = inject(ExpenseStore);
  private dialog = inject(MatDialog);
  private injector = inject(Injector);

  readonly money = money;
  readonly signed = signedMoney;
  readonly busy = signal(false);

  readonly myBalance = computed(() => balanceText(this.store.myNet(), this.store.base()));

  readonly groups = computed(() => {
    const me = this.store.viewerKey();
    const today = todayIso();
    const currentCount = this.store.currentParticipants().length;
    const byDay = new Map<string, Expense[]>();
    for (const e of this.store.expenses()) {
      if (!byDay.has(e.spent_on)) byDay.set(e.spent_on, []);
      byDay.get(e.spent_on)!.push(e);
    }
    return [...byDay].map(([day, list]) => ({
      day,
      label: day === today ? 'Today' : dayFmt.format(Date.parse(`${day}T00:00:00Z`)),
      rows: list.map(e => {
        const mine = e.shares.find(s => s.participant === me)?.cents ?? null;
        const n = e.shares.length;
        return {
          e,
          icon: EXPENSE_CATEGORY_META[e.category]?.icon ?? 'receipt_long',
          payer: this.name(e.paid_by),
          splitLabel: e.split_mode === 'custom' ? 'custom split'
            : n === currentCount ? 'split between everyone'
            : n === 1 ? `for ${this.name(e.shares[0].participant)}` : `split ${n} ways`,
          mine,
          canEdit: this.store.canEdit(e),
        };
      }),
    }));
  });

  // ---------- currency editor (owner) ----------
  readonly showCurrency = signal(false);
  readonly baseDraft = signal('EUR');
  readonly rateDrafts = signal<Record<string, string>>({});
  readonly currencyOptions = computed(() => [...new Set([...CURRENCIES, this.store.base()])]);
  readonly rateCurrencies = computed(() =>
    [...new Set([...this.store.usedCurrencies(), ...Object.keys(this.store.ledger()?.currency.rates ?? {})])]
      .filter(c => c !== this.baseDraft()));
  readonly currencyError = signal<string | null>(null);

  name(key: string): string {
    if (key === this.store.viewerKey()) return 'You';
    return this.store.byKey().get(key)?.name ?? 'Former member';
  }

  kindIcon(s: BookingSuggestion): string {
    return BOOKING_KIND_META[s.kind]?.icon ?? 'bookmark';
  }

  openAdd(): void {
    openExpenseDialog(this.dialog, this.injector, { mode: 'create' });
  }

  openEdit(e: Expense): void {
    if (this.store.canEdit(e)) openExpenseDialog(this.dialog, this.injector, { mode: 'edit', expense: e });
  }

  async addFromBooking(s: BookingSuggestion): Promise<void> {
    this.busy.set(true);
    await this.store.fromBooking(s.item_id);
    this.busy.set(false);
  }

  toggleCurrency(): void {
    if (this.showCurrency()) {
      this.showCurrency.set(false);
      return;
    }
    const l = this.store.ledger();
    this.baseDraft.set(l?.currency.base ?? 'EUR');
    this.rateDrafts.set(Object.fromEntries(Object.entries(l?.currency.rates ?? {}).map(([c, r]) => [c, String(r)])));
    this.currencyError.set(null);
    this.showCurrency.set(true);
  }

  setRate(currency: string, value: string): void {
    this.rateDrafts.update(prev => ({ ...prev, [currency]: value }));
  }

  async saveCurrency(): Promise<void> {
    const rates: Record<string, number> = {};
    for (const cur of this.rateCurrencies()) {
      const raw = (this.rateDrafts()[cur] ?? '').trim().replace(',', '.');
      if (!raw) continue;
      const rate = Number(raw);
      if (!Number.isFinite(rate) || rate <= 0) {
        this.currencyError.set(`Please check the rate for ${cur}.`);
        return;
      }
      rates[cur] = rate;
    }
    this.currencyError.set(null);
    this.busy.set(true);
    const ok = await this.store.setCurrency({ baseCurrency: this.baseDraft(), rates });
    this.busy.set(false);
    if (ok) this.showCurrency.set(false);
  }
}
