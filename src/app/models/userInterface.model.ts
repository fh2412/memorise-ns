export interface MemoriseUser {
    user_id: string;
    username: string;
    name: string;
    email: string;
    bio: string;
    country: string;
    gender: string;
    formatted_dob: string;
    dob: string;
    instagram: string;
    location_id: number;
    profilepic: string;
  }
  

  export interface Friend {
    country: string | null;
    dob: Date | null;
    name: string;
    profilepic: string | null;
    sharedMemoriesCount: number;
    user_id: number;
    gender: string;
  }
  