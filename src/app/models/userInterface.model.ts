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
  profilepic_thumb: string;
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
  profilepic_thumb: string | null;
  sharedMemoriesCount: number;
  user_id: string;
  gender: string;
  email: string;
  isCreator?: boolean;
}

export interface CrewMember {
  country: string | null;
  dob: Date | null;
  name: string;
  profilepic: string | null;
  profilepic_thumb: string | null;
  sharedMemoriesCount: number;
  user_id: string;
  gender: string;
  email: string;
  status: 'online' | 'away' | 'offline';
  isCreator?: boolean;
  isPlaceholder?: boolean;
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

export function crewMemberToFriend(member: CrewMember): MemoryDetailFriend {
  return {
    user_id: member.user_id,
    name: member.name,
    country: member.country,
    dob: member.dob,
    // the avatars are small, so prefer the thumbnail and fall back to the full picture
    profilepic: member.profilepic_thumb ?? member.profilepic,
    sharedMemoriesCount: member.sharedMemoriesCount,
    // CrewMember carries no friendship info, so this is the neutral default
    friendship_status: 'none',
  };
}