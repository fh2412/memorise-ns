export enum AccountType {
  FREE = 'Free',
  PREMIUM = 'Pro',
  CORPORATE = 'Corporate'
}

export interface UserStorageData {
  userId: string;
  accountType: AccountType;
  storageUsedBytes: number;
}

export interface StorageLimit {
  maxStorageBytes: number;
  isUnlimited: boolean;
}