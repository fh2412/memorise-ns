import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CrewMember } from '@models/userInterface.model';
import { PLAN_EVENT_FALLBACK, PLAN_EVENT_META, PlanEvent } from '@models/planItem.model';

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function timeAgo(iso: string, now: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const sec = Math.round((t - now) / 1000);
  const abs = Math.abs(sec);
  if (abs < 45) return 'just now';
  if (abs < 3_600) return rtf.format(Math.round(sec / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(sec / 3_600), 'hour');
  if (abs < 7 * 86_400) return rtf.format(Math.round(sec / 86_400), 'day');
  return new Date(t).toLocaleDateString();
}

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

    return this.events().map(e => {
      const member = byId.get(e.user_id);
      const name = member?.name ?? 'Former member';
      const meta = PLAN_EVENT_META[e.action] ?? PLAN_EVENT_FALLBACK;
      return {
        id: e.event_id,
        who: e.user_id === me ? 'You' : name,
        initial: name.charAt(0).toUpperCase(),
        avatar: member?.profilepic_thumb || null,
        verb: meta.verb,
        icon: meta.icon,
        title: e.item_title,
        at: e.created_at,
        ago: timeAgo(e.created_at, now),
      };
    });
  });
}