import { MemoriseLocation } from "./location.model";

export interface MemoriseActivity {
    title: string;
    activityId: number;
}

export interface CreateActivityResponse {
    message: string;
    activityId: number;
}

export interface MemoriseUserActivity {
    activityId: number,
    title: string,
    isPrivate: boolean,
    groupSizeMin: number,
    groupSizeMax: number,
    costs: number,
    description: string,
    link: string,
    indoor: boolean,
    season: string,
    weather: string,
    location: MemoriseLocation,
    firebaseUrl: string,
}

export interface ActivityFilter {
    location?: string;
    distance?: number;
    tag?: string;
    groupSizeMin?: number;
    groupSizeMax?: number;
    price?: number;
    season?: string;
    weather?: string;
    name?: string;
  }