export type DayState = 'yes' | 'maybe';

export interface DateFinderSettings {
  range_start: string; // YYYY-MM-DD
  range_end: string;
  min_days: number;
  max_days: number;
}

export interface MemberAvailability {
  user_id: string;
  updated_at: string;
  yes: string[];
  maybe: string[];
}

export interface DateFinderData {
  settings: DateFinderSettings | null;
  members: string[];
  availability: MemberAvailability[];
}

export interface DateFinderSettingsInput {
  rangeStart: string;
  rangeEnd: string;
  minDays: number;
  maxDays: number;
}

export interface DayHeat { yes: string[]; maybe: string[]; }