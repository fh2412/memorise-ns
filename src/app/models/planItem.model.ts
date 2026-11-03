import { CrewMember } from '@models/userInterface.model';
import { PlannedMemory, PlanLocation } from '@models/memoryInterface.model';


export type PlanItemType = 'note' | 'idea' | 'todo' | 'link' | 'poll' | 'booking';
export type PlanItemStatus = 'open' | 'decided' | 'done' | 'dismissed';
export type PlanCategory = 'dates' | 'destination' | 'stay' | 'transport' | 'activity' | 'other';

export interface PlanViewer {
  userId: CrewMember['user_id'];
  isOwner: boolean;
}

export interface PlanBoard {
  items: PlanItem[];
  viewer: PlanViewer;
}

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
  poll?: PollData | null;
}

export type NewPlanItem = Pick<PlanItem, 'type' | 'title'> &
  Partial<Pick<PlanItem,
    'category' | 'description' | 'payload' | 'due_date' | 'board_x' | 'board_y' | 'color' | 'assignees'>>;

export type PlanItemPatch = Partial<
  Omit<PlanItem, 'item_id' | 'memory_id' | 'created_by' | 'created_at' | 'updated_at'>
>;

export const PLAN_ITEM_TYPES: Record<PlanItemType,
  { label: string; icon: string; color: string; creatable: boolean }> = {
  note: { label: 'Note', icon: 'sticky_note_2', color: '#fff59d', creatable: true },
  idea: { label: 'Idea', icon: 'lightbulb', color: '#ffe0b2', creatable: true },
  todo: { label: 'To-do', icon: 'check_circle', color: '#c8e6c9', creatable: true },
  link: { label: 'Link', icon: 'link', color: '#bbdefb', creatable: true },
  poll: { label: 'Poll', icon: 'how_to_vote', color: '#e1bee7', creatable: false }, // Phase 1a
  booking: { label: 'Booking', icon: 'hotel', color: '#b2dfdb', creatable: false }, // Phase 1c
};

export const PLAN_CATEGORIES: { key: PlanCategory; label: string; icon: string }[] = [
  { key: 'dates', label: 'Dates', icon: 'event' },
  { key: 'destination', label: 'Destination', icon: 'place' },
  { key: 'stay', label: 'Stay', icon: 'hotel' },
  { key: 'transport', label: 'Transport', icon: 'commute' },
  { key: 'activity', label: 'Activities', icon: 'hiking' },
  { key: 'other', label: 'Other', icon: 'more_horiz' },
];

export interface PlanEvent {
  event_id: number;
  user_id: CrewMember['user_id'];
  action: string;
  item_id: number | null;
  item_title: string | null;
  created_at: string;
}

export type PlanPhase = 'planning' | 'upcoming' | 'live' | 'wrapping_up' | 'archived';
const WRAP_UP_DAYS = 7;

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function planPhase(start?: string | null, end?: string | null, now = new Date()): PlanPhase {
  if (!start) return 'planning';
  const today = isoDay(now);
  const s = start.slice(0, 10);
  const e = (end || start).slice(0, 10);
  if (today < s) return 'upcoming';
  if (today <= e) return 'live';
  const [y, m, d] = e.split('-').map(Number);
  return today <= isoDay(new Date(y, m - 1, d + WRAP_UP_DAYS)) ? 'wrapping_up' : 'archived';
}

export const PLAN_EVENT_META: Record<string, { verb: string; icon: string }> = {
  item_created: { verb: 'added', icon: 'add_circle' },
  item_updated: { verb: 'edited', icon: 'edit' },
  item_completed: { verb: 'completed', icon: 'task_alt' },
  item_reopened: { verb: 'reopened', icon: 'replay' },
  item_dismissed: { verb: 'dismissed', icon: 'block' },
  item_deleted: { verb: 'deleted', icon: 'delete' },
  dates_set: { verb: 'locked the dates to', icon: 'event_available' },
  dates_cleared: { verb: 'reopened the date search', icon: 'event_busy' },
  availability_updated: { verb: 'updated their availability', icon: 'edit_calendar' },
  date_finder_updated: { verb: 'changed the date search to', icon: 'date_range' },
  poll_created: { verb: 'started a poll', icon: 'how_to_vote' },
  poll_voted: { verb: 'voted on', icon: 'how_to_vote' },
  poll_unvoted: { verb: 'withdrew their vote on', icon: 'undo' },
  poll_option_added: { verb: 'added an option to', icon: 'playlist_add' },
  poll_option_updated: { verb: 'edited an option in', icon: 'edit' },
  poll_option_removed: { verb: 'removed an option from', icon: 'playlist_remove' },
  poll_updated: { verb: 'changed the settings of', icon: 'tune' },
  poll_decided: { verb: 'picked', icon: 'emoji_events' },
  poll_reopened: { verb: 'reopened', icon: 'replay' },
  destination_set: { verb: 'set the destination to', icon: 'place' },
};
export const PLAN_EVENT_FALLBACK = { verb: 'updated', icon: 'bolt' };

export interface PollOption {
  option_id: number;
  label: string;
  sort_order: number;
  created_by: string;
  location: PlanLocation | null;
  votes: number | null;     // null = results hidden for me
  voters: string[] | null;
}

export interface PollData {
  multiple: boolean;
  max_choices: number | null;
  closes_at: string | null; // ISO UTC
  is_closed: boolean;
  allow_member_options: boolean;
  hide_results: boolean;
  decided_option_id: number | null;
  decided_by: string | null;
  decided_at: string | null;
  source_item_id: number | null;
  results_visible: boolean;
  total_voters: number;
  my_votes: number[];
  options: PollOption[];
}

export type PollCategory = Exclude<PlanCategory, 'dates'>;
export const POLL_CATEGORIES = PLAN_CATEGORIES.filter(c => c.key !== 'dates');
export const POLL_QUESTIONS: Record<PollCategory, string> = {
  destination: 'Where should we go?',
  stay: 'Where should we stay?',
  transport: 'How do we get there?',
  activity: 'What should we do?',
  other: 'What do you prefer?',
};

export interface NewPollOption { label: string; location?: PlanLocation | null; }

export interface NewPoll {
  title: string;
  description?: string | null;
  category: PollCategory;
  options: NewPollOption[];
  multiple?: boolean;
  maxChoices?: number | null;
  closesAt?: string | null;
  allowMemberOptions?: boolean;
  hideResults?: boolean;
  sourceItemId?: number;
  board_x?: number;
  board_y?: number;
  color?: string | null;
}

export interface PollSettingsPatch { closesAt?: string | null; allowMemberOptions?: boolean; hideResults?: boolean; }
export interface PollOptionPatch { label?: string; location?: PlanLocation | null; }
export interface DecidePollBody { optionId: number; location?: PlanLocation; }