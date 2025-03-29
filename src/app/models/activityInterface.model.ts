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
