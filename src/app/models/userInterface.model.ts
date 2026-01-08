import { AccountType } from "./billing.model";

export interface MemoriseUser {
  user_id: string;
  account_type: AccountType;
  username: string;
  name: string;
  email: string;
  bio: string;
  country: string;
  country_cca2: string;
  gender: string;
  formatted_dob: string;
  dob: string;
  instagram: string;
  location_id: number;
  profilepic: string;
  company_id: number;
}

export interface CreateUserResponse {
  message: string;
  firebaseUid: string;
  token: string;
}


export interface Friend {
  country: string | null;
  dob: Date | null;
  name: string;
  profilepic: string | null;
  sharedMemoriesCount: number;
  user_id: string;
  gender: string;
  email: string;
}

export interface MemoryDetailFriend {
  country: string | null;
  dob: Date | null;
  name: string;
  profilepic: string | null;
  sharedMemoriesCount: number;
  user_id: string;
  friendship_status: string | "none";
}

export interface FriendStatus {
  user_id1: string;
  user_id2: string;
  status: string;
}