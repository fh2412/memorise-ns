// @services/plan-expense.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CurrencyInput, ExpenseInput, Ledger, ParticipantKey } from '@models/livePlan.model';

/** Every call returns the full, recalculated ledger. */
@Injectable({ providedIn: 'root' })
export class PlanExpenseService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private base(memoryId: string, path = ''): string {
    return `${this.apiUrl}/memories/${memoryId}/plan/expenses${path}`;
  }

  getLedger(memoryId: string): Observable<Ledger> {
    return this.http.get<Ledger>(this.base(memoryId));
  }

  create(memoryId: string, input: ExpenseInput): Observable<Ledger> {
    return this.http.post<Ledger>(this.base(memoryId), input);
  }

  update(memoryId: string, expenseId: number, patch: Partial<ExpenseInput>): Observable<Ledger> {
    return this.http.patch<Ledger>(this.base(memoryId, `/${expenseId}`), patch);
  }

  remove(memoryId: string, expenseId: number): Observable<Ledger> {
    return this.http.delete<Ledger>(this.base(memoryId, `/${expenseId}`));
  }

  fromBooking(memoryId: string, itemId: number, participants?: ParticipantKey[]): Observable<Ledger> {
    return this.http.post<Ledger>(this.base(memoryId, `/from-booking/${itemId}`), participants ? { participants } : {});
  }

  setCurrency(memoryId: string, input: CurrencyInput): Observable<Ledger> {
    return this.http.put<Ledger>(this.base(memoryId, '/currency'), input);
  }
}
