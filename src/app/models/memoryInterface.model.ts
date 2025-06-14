// memoryInterface.model.ts

export interface Memory {
    memory_id: number;
    user_id: string;
    image_url: string;
    latitude: string;
    longitude: string;
    location_id: number;
    memory_date: string;
    memory_end_date: string;
    picture_count: number;
    text: string;
    title: string;
    title_pic: string;
    username: string;
    activity_id: number;
  }

  export interface MemoryFormData {
    creator_id: string;
    title: string;
    description: string;
    firestore_bucket_url: string;
    memory_date: Date | null;
    memory_end_date: Date | null;
    title_pic: string;
    location_id: number;
    lng: string;
    lat: string;
    l_country: string;
    l_city: string;
    l_postcode: string;
    quickActivityTitle: string;
    activity_id: number | null;
  }

export interface CreateMemoryResponse {
  message: string;
  memory_id: string;
}