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
    websiteUrl: string,
    indoor: string,
    seasons: [string],
    weathers: [string],
    location: MemoriseLocation,
    firebaseUrl: string,
    leadMemoryId: number | null
}

export interface ActivityFilter {
    location?: string;
    locationCoords?: {lat: number; lng: number};
    distance?: number;
    tag?: string;
    groupSize?: number;
    price?: number;
    season?: string;
    weather?: string;
    name?: string;
    activityType?: string;
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
    indoor: string;
    costs: number;
    locationId: number;
    baseMemoryId: string;
    firebaseUrl: string;
    websiteUrl: string;
    seasons: Season[];
    weatherConditions: Weather[];
    location: MemoriseLocation;
}

export interface ActivityCreator {
    creator_name: string;
    created_activities_count: number;
}

export interface ActivityStats {
    activity_count: number;
    stars_count: number;
}

export interface BookmarkedActivity {
    activityId: number;
    firebaseUrl: string;
    groupSizeMax: number;
    groupSizeMin: number;
    title: string;
}

export interface Season {
    season_id: number;
    name: string;
}

export interface Weather {
    weather_id: number;
    name: string;
    description: string;
}