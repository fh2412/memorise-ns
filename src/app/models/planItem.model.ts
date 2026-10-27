import { CrewMember } from '@models/userInterface.model';
import { PlannedMemory } from '@models/memoryInterface.model';

export type PlanItemType = 'note' | 'idea' | 'todo' | 'link' | 'poll' | 'booking';
export type PlanItemStatus = 'open' | 'decided' | 'done' | 'dismissed';
export type PlanCategory = 'dates' | 'destination' | 'stay' | 'transport' | 'activity' | 'other';

export interface PlanItem {
  item_id: number;
  memory_id: PlannedMemory['memory_id'];
  type: PlanItemType;
  category: PlanCategory;
  status: PlanItemStatus;
  title: string;
  description: string | null;
  payload: Record<string, unknown> | null; // type-specific data (url, poll options, booking…)
  due_date: string | null;                 // 'YYYY-MM-DD'
  board_x: number;
  board_y: number;
  color: string | null;
  created_by: CrewMember['user_id'];
  assignees: CrewMember['user_id'][];
  created_at: string;
  updated_at: string;
}

export type NewPlanItem = Pick<PlanItem, 'type' | 'title'> &
  Partial<Pick<PlanItem,
    'category' | 'description' | 'payload' | 'due_date' | 'board_x' | 'board_y' | 'color' | 'assignees'>>;

export type PlanItemPatch = Partial<
  Omit<PlanItem, 'item_id' | 'memory_id' | 'created_by' | 'created_at' | 'updated_at'>
>;

export const PLAN_ITEM_TYPES: Record<PlanItemType,
  { label: string; icon: string; color: string; creatable: boolean }> = {
  note:    { label: 'Note',    icon: 'sticky_note_2', color: '#fff59d', creatable: true },
  idea:    { label: 'Idea',    icon: 'lightbulb',     color: '#ffe0b2', creatable: true },
  todo:    { label: 'To-do',   icon: 'check_circle',  color: '#c8e6c9', creatable: true },
  link:    { label: 'Link',    icon: 'link',          color: '#bbdefb', creatable: true },
  poll:    { label: 'Poll',    icon: 'how_to_vote',   color: '#e1bee7', creatable: false }, // Phase 1a
  booking: { label: 'Booking', icon: 'hotel',         color: '#b2dfdb', creatable: false }, // Phase 1c
};

export const PLAN_CATEGORIES: { key: PlanCategory; label: string; icon: string }[] = [
  { key: 'dates',       label: 'Dates',       icon: 'event' },
  { key: 'destination', label: 'Destination', icon: 'place' },
  { key: 'stay',        label: 'Stay',        icon: 'hotel' },
  { key: 'transport',   label: 'Transport',   icon: 'commute' },
  { key: 'activity',    label: 'Activities',  icon: 'hiking' },
  { key: 'other',       label: 'Other',       icon: 'more_horiz' },
];