import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { AccountType, StorageLimit, UserStorageData } from '../models/billing.model';

export interface DeletionData {
  size: number;
  userId: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);


  private userStorageData = signal<UserStorageData | null>(null);

  // Computed signal for storage in GB
  readonly storageUsedGB = computed(() => {
    const data = this.userStorageData();
    if (!data) return 0;
    return data.storageUsedBytes / (1024 * 1024 * 1024);
  });

  // Computed signal to check if user can create new memory
  readonly canCreateNewMemory = computed(() => {
    const data = this.userStorageData();
    if (!data) return false;

    // No limit for premium and corporate users
    if (data.accountType === AccountType.PREMIUM ||
      data.accountType === AccountType.CORPORATE) {
      return true;
    }

    // Free users have 5GB limit
    if (data.accountType === AccountType.FREE) {
      const storageGB = this.storageUsedGB();
      return storageGB < 5;
    }

    return false;
  });

  // Computed signal for storage limit message
  readonly storageStatusMessage = computed(() => {
    const data = this.userStorageData();
    if (!data) return '';

    const storageGB = this.storageUsedGB();

    if (data.accountType === AccountType.FREE) {
      return `Storage: ${storageGB.toFixed(2)} GB / 5 GB`;
    }

    return `Storage: ${storageGB.toFixed(2)} GB (Unlimited)`;
  });



  private apiUrl = `${environment.apiUrl}/billing`;

  updateFreeUserStorageUsed(user_id: string, data_size: number): Observable<any> {
    this.updateStorageUsed(data_size);
    return this.http.put(`${this.apiUrl}/freetier/${user_id}`, { data_size });
  }

  async updateStorageOnDeletion(dataArray: DeletionData[]): Promise<void> {
    if (dataArray.length === 0) {
      return;
    }

    const updatePromises: Promise<any>[] = dataArray.map(del => {
      const updateObservable = this.updateFreeUserStorageUsed(del.userId, -del.size);
      this.updateStorageUsed(-del.size);
      return firstValueFrom(updateObservable);
    });

    try {
      await Promise.all(updatePromises);
      console.log("All storage updates completed successfully.");
    } catch (error) {
      console.error("One or more storage updates failed:", error);
      throw error;
    }
  }

  setUserStorageData(data: UserStorageData): void {
    this.userStorageData.set(data);
  }

  /**
   * Update only the storage used (e.g., after uploading/deleting files)
   */
  updateStorageUsed(storageUsedBytes: number): void {
    const currentData = this.userStorageData();
    if (currentData) {
      this.userStorageData.set({
        ...currentData,
        storageUsedBytes
      });
    }
  }

  /**
   * Get current storage data
   */
  getUserStorageData(): UserStorageData | null {
    return this.userStorageData();
  }

  /**
   * Get storage limit for current user
   */
  getStorageLimit(): StorageLimit {
    const data = this.userStorageData();
    
    if (!data) {
      return { maxStorageBytes: 0, isUnlimited: false };
    }
    
    if (data.accountType === AccountType.FREE) {
      return {
        maxStorageBytes: 5 * 1024 * 1024 * 1024, // 5GB in bytes
        isUnlimited: false
      };
    }
    
    return {
      maxStorageBytes: 0,
      isUnlimited: true
    };
  }
}