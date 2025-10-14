export enum AccountType {
  FREE = 'free',
  PREMIUM = 'premium',
  CORPORATE = 'corporate'
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