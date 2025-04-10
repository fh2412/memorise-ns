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

export interface ActivityDetails {
    id: number;
    title: string;
    description: string;
    creatorId: string;
    creationDate: string;
    activeFlag: boolean;
    commercialFlag: boolean;
    groupSizeMin: number;
    groupSizeMax: number;
    indoor: boolean;
    costs: number;
    locationId: number;
    baseMemoryId: string;
    firebaseUrl: string;
    websiteUrl: string;
    seasons: Season[];
    weatherConditions: Weather[];
    location: MemoriseLocation;
}

export interface Season {
    id: number;
    name: string;
}

export interface Weather {
    id: number;
    name: string;
    description: string;
}