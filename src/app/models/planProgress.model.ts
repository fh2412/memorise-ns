export type MilestoneKey = 'dates' | 'destination' | 'stay' | 'transport';
export type ManualMilestoneKey = Exclude<MilestoneKey, 'dates'>;
export type MilestoneState = 'open' | 'done' | 'skipped';
export type ManualState = Exclude<MilestoneState, 'open'>;

export interface ManualMilestone { milestone: ManualMilestoneKey; state: ManualState; }
export interface MilestoneStatus { key: MilestoneKey; state: MilestoneState; source: 'auto' | 'manual' | null; }
export interface TodoCount { done: number; total: number; }
export interface PlanProgress { milestones: MilestoneStatus[]; todos: TodoCount; }

export const MILESTONES: MilestoneKey[] = ['dates', 'destination', 'stay', 'transport'];

export const MILESTONE_META: Record<MilestoneKey, { label: string; icon: string }> = {
  dates:       { label: 'Dates',       icon: 'event' },
  destination: { label: 'Destination', icon: 'place' },
  stay:        { label: 'Stay',        icon: 'hotel' },
  transport:   { label: 'Transport',   icon: 'commute' },
};

/** Mirror of the backend's buildProgress: derived data wins over manual states. */
export function buildProgress(input: {
  hasDates: boolean;
  hasLocation: boolean;
  decided: ReadonlySet<string>;
  manual: readonly ManualMilestone[];
  todos: TodoCount;
}): PlanProgress {
  const manual = new Map(input.manual.map(m => [m.milestone, m.state]));
  return {
    milestones: MILESTONES.map((key): MilestoneStatus => {
      const auto = key === 'dates' ? input.hasDates
        : key === 'destination' ? input.hasLocation || input.decided.has('destination')
        : input.decided.has(key);
      if (auto) return { key, state: 'done', source: 'auto' };
      const state = key === 'dates' ? undefined : manual.get(key);
      return state ? { key, state, source: 'manual' } : { key, state: 'open', source: null };
    }),
    todos: input.todos,
  };
}

export interface ProgressSummary {
  percent: number;
  milestonesDone: number;
  milestonesTotal: number;
  todosDone: number;
  todosTotal: number;
  openLabels: string[];
}

/** Each active milestone is one step; all to-dos together are one more step. */
export function summarizeProgress(p: PlanProgress): ProgressSummary {
  const active = p.milestones.filter(m => m.state !== 'skipped');
  const done = active.filter(m => m.state === 'done').length;
  const { done: todosDone, total: todosTotal } = p.todos;
  const steps = active.length + (todosTotal > 0 ? 1 : 0);
  const reached = done + (todosTotal > 0 ? todosDone / todosTotal : 0);
  return {
    percent: steps ? Math.round((reached / steps) * 100) : 0,
    milestonesDone: done,
    milestonesTotal: active.length,
    todosDone,
    todosTotal,
    openLabels: active.filter(m => m.state === 'open').map(m => MILESTONE_META[m.key].label),
  };
}