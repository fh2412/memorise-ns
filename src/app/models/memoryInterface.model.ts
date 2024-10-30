// memoryInterface.model.ts

export interface Memory {
    memory_id: number;
    user_id: number;
    image_url: string;
    latitude: string;
    longitude: string;
    location_id: number;
    memory_date: string;  // or Date, depending on usage
    memory_end_date: string;  // or Date
    picture_count: number;
    text: string;
    title: string;
    title_pic: string;
    username: string;
  }
  