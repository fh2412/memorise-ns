import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { AccountType, UserStorageData } from '../models/billing.model';

export interface DeletionData {
  size: number;
  userId: string;
  path: string;
}

const GiB = 1024 ** 3;

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/billing`;

  private userStorageData = signal<UserStorageData | null>(null);

  readonly accountType = computed(() => this.userStorageData()?.accountType ?? AccountType.FREE);

  readonly storageUsedBytes = computed(() => this.userStorageData()?.storageUsedBytes ?? 0);

  /** Plan limit in bytes. Infinity for UNLIMITED. */
  readonly storageLimitBytes = computed(() => {
    // TODO: once the backend sends a reliable limit (model field `stroageMaxBytes` has a typo), use that instead.
    switch (this.accountType()) {
      case AccountType.UNLIMITED: return Infinity;
      case AccountType.PRO: return 50 * GiB;
      case AccountType.FREE: return 5 * GiB;
      default: return 0;
    }
  });

  /**
   * Bytes the user can still upload.
   * Infinity while storage data isn't loaded – the backend enforces the real limit anyway.
   */
  readonly remainingBytes = computed(() => {
    if (!this.userStorageData()) return Infinity;
    return Math.max(0, this.storageLimitBytes() - this.storageUsedBytes());
  });

  readonly storageUsedGB = computed(() => this.storageUsedBytes() / GiB);

  /** FIX: previously returned raw bytes. Now GB, Infinity for UNLIMITED. */
  readonly storageMaxGB = computed(() => this.storageLimitBytes() / GiB);

  readonly canCreateNewMemory = computed(() => !!this.userStorageData() && this.remainingBytes() > 0);

  readonly storageStatusMessage = computed(() => {
    if (!this.userStorageData()) return '';
    const used = this.storageUsedGB().toFixed(2);
    const max = this.storageMaxGB();
    return Number.isFinite(max)
      ? `Storage: ${used} GB / ${max} GB`
      : `Storage: ${used} GB (Unlimited)`;
  });

  /** Legacy client-side accounting. The new upload flow lets the backend count storage. */
  updateFreeUserStorageUsed(user_id: string, data_size: number): Observable<unknown> {
    this.updateStorageUsed(data_size);
    return this.http.put(`${this.apiUrl}/freetier/${user_id}`, { data_size });
  }

  async updateStorageOnDeletion(dataArray: DeletionData[]): Promise<void> {
    if (dataArray.length === 0) return;

    // FIX: updateFreeUserStorageUsed already adjusts the local value – no second local update.
    const updates = dataArray.map(del =>
      firstValueFrom(this.updateFreeUserStorageUsed(del.userId, -del.size)),
    );

    try {
      await Promise.all(updates);
    } catch (error) {
      console.error('One or more storage updates failed:', error);
      throw error;
    }
  }

  setUserStorageData(data: UserStorageData): void {
    this.userStorageData.set(data);
  }

  /** Sets the absolute value (e.g. from a backend response). */
  setStorageUsedBytes(storageUsedBytes: number): void {
    this.userStorageData.update(current => current ? { ...current, storageUsedBytes } : current);
  }

  /**
   * Adjusts the used storage by a DELTA (positive = added, negative = freed).
   * FIX: previously overwrote the total with the delta.
   */
  updateStorageUsed(deltaBytes: number): void {
    this.userStorageData.update(current =>
      current ? { ...current, storageUsedBytes: Math.max(0, current.storageUsedBytes + deltaBytes) } : current,
    );
  }
}
