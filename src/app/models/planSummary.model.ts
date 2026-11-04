import { PlanProgress } from '@models/planProgress.model';

export interface PlanSummaryCrewMember {
  user_id: string;
  name: string;
  profilepic_thumb: string | null;
  isCreator: boolean;
  isPlaceholder: boolean;
}

export interface PlanSummary {
  memory_id: string;
  title_pic?: string;
  title: string;
  memory_date: string | null;
  memory_end_date: string | null;
  is_owner: boolean;
  location: { city: string; country: string } | null;
  last_activity_at: string | null;
  crew_members: PlanSummaryCrewMember[];
  progress: PlanProgress;
}