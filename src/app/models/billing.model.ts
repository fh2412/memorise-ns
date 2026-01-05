export enum AccountType {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
  PRO = 'PRO',
  UNLIMITED = 'UNLIMITED'
}

export interface UserStorageData {
  userId: string;
  accountType: AccountType;
  storageUsedBytes: number;
}