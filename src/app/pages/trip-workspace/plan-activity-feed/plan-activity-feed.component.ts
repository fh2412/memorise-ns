import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CrewMember } from '@models/userInterface.model';
import { HIDDEN_EVENT_ACTIONS, PLAN_EVENT_FALLBACK, PLAN_EVENT_META, PlanEvent } from '@models/planItem.model';
import { formatRange } from '../date-finder/date-utils';
import { MILESTONE_META, MilestoneKey } from '@models/planProgress.model';
import { timeAgo } from '../time-ago';

const RANGE_ACTIONS = new Set(['dates_set', 'date_finder_updated']);

@Component({
  selector: 'app-plan-activity-feed',
  imports: [DatePipe, MatIconModule, MatButtonModule],
  templateUrl: './plan-activity-feed.component.html',
  styleUrl: './plan-activity-feed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanActivityFeedComponent {
  events = input.required<PlanEvent[]>();
  crew = input.required<CrewMember[]>();
  viewerId = input<string | null>(null);
  hasMore = input(false);
  loadingMore = input(false);
  loadMore = output<void>();

  private readonly now = signal(Date.now());

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  readonly rows = computed(() => {
    const now = this.now();
    const me = this.viewerId();
    const byId = new Map(this.crew().map(m => [m.user_id, m]));
    const nameOf = (id: string | null) =>
      id === me ? 'you' : (id && byId.get(id)?.name) || 'a former member';
  
    return this.events()
      .filter(e => !HIDDEN_EVENT_ACTIONS.has(e.action))
      .map(e => {
        const member = byId.get(e.user_id);
        const name = member?.name ?? 'Former member';
        const meta = PLAN_EVENT_META[e.action] ?? PLAN_EVENT_FALLBACK;
        let verb = meta.verb;
        let title = e.item_title;
        let quoted = true;
  
        if (e.action === 'item_assigned') {
          verb = e.target_user_id === e.user_id ? 'took on' : `assigned ${nameOf(e.target_user_id)} to`;
        } else if (RANGE_ACTIONS.has(e.action) && title) {
          const [from, to] = title.split('/');
          title = formatRange(from, to);
          quoted = false;
        } else if (e.action.startsWith('milestone_') && title) {
          title = MILESTONE_META[title as MilestoneKey]?.label ?? title;
          quoted = false;
        }
  
        return {
          id: e.event_id,
          who: e.user_id === me ? 'You' : name,
          initial: name.charAt(0).toUpperCase(),
          avatar: member?.profilepic_thumb || null,
          verb,
          icon: meta.icon,
          title,
          quoted,
          at: e.created_at,
          ago: timeAgo(e.created_at, now),
        };
      });
  });
}