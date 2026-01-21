export enum AccountType {
  FREE = 'FREE',
  PRO = 'PRO',
  UNLIMITED = 'UNLIMITED'
}

export interface UserStorageData {
  userId: string;
  accountType: AccountType;
  storageUsedBytes: number;
  stroageMaxBytes: number;
}