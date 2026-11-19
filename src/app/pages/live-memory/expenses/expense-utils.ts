// pages/live-memory/expenses/expense-utils.ts
import { Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { formatPrice } from '../../trip-workspace/link-preview/link-utils';
import { ExpenseDialogComponent, ExpenseDialogData } from './expense-dialog/expense-dialog.component';

export const money = (cents: number, currency: string): string => formatPrice(cents, currency);

export const signedMoney = (cents: number, currency: string): string =>
  cents > 0 ? `+${money(cents, currency)}` : cents < 0 ? `−${money(-cents, currency)}` : money(0, currency);

/** "You get back €42" / "You owe €12" / "All square". */
export function balanceText(net: number | null, currency: string): { label: string; amount: string } {
  if (net === null) return { label: 'Your balance', amount: 'Rate missing' };
  if (net > 0) return { label: 'You get back', amount: money(net, currency) };
  if (net < 0) return { label: 'You owe', amount: money(-net, currency) };
  return { label: 'Your balance', amount: 'All square' };
}

/** Opens the expense dialog with the caller's injector (dialog needs ExpenseStore). */
export function openExpenseDialog(dialog: MatDialog, injector: Injector, data: ExpenseDialogData): void {
  dialog.open<ExpenseDialogComponent, ExpenseDialogData, boolean>(ExpenseDialogComponent, {
    width: '560px',
    maxWidth: '95vw',
    maxHeight: '92vh',
    autoFocus: false,
    injector,
    data,
  });
}
