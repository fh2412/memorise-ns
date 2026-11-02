import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DayHeat, DayState } from '@models/dateFinder.model';
import { isoOf, todayIso, toUtcMs } from '../date-utils';

export type CalendarMode = 'mine' | 'group';
export type Brush = DayState | 'erase';

interface CalendarDay {
  iso: string;
  day: number;
  disabled: boolean;
  isToday: boolean;
  state: DayState | null;
  level: 0 | 1 | 2 | 3 | 4;   // group heat level
  inWindow: boolean;          // part of the highlighted suggestion
  label: string;              // aria-label + native tooltip
}

interface CalendarMonth { key: string; label: string; offset: number; days: CalendarDay[]; }

const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const STATE_LABEL: Record<DayState, string> = { yes: 'available', maybe: 'if needed' };
const MAX_MONTHS = 14; // backend caps the range at 366 days

@Component({
  selector: 'app-availability-calendar',
  templateUrl: './availability-calendar.component.html',
  styleUrl: './availability-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:pointerup)': 'endPaint()',
    '(window:pointercancel)': 'endPaint()',
  },
})
export class AvailabilityCalendarComponent {
  rangeStart = input.required<string>();
  rangeEnd = input.required<string>();
  mode = input<CalendarMode>('mine');
  marks = input<ReadonlyMap<string, DayState>>(new Map());
  heat = input<ReadonlyMap<string, DayHeat>>(new Map());
  responderCount = input(0);
  names = input<ReadonlyMap<string, string>>(new Map());
  brush = input<Brush>('yes');
  highlight = input<{ start: string; end: string } | null>(null);

  paint = output<{ day: string; state: DayState | null }>();

  readonly weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  private paintState: DayState | null | undefined = undefined; // undefined = not painting
  private lastPainted: string | null = null;

  readonly months = computed<CalendarMonth[]>(() => {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    const today = todayIso();
    if (end < start || end < today) return [];

    const mode = this.mode();
    const marks = this.marks();
    const heat = this.heat();
    const total = Math.max(1, this.responderCount());
    const names = this.names();
    const hl = this.highlight();
    const nameList = (ids: string[]) => ids.map(id => names.get(id) ?? 'Unknown').join(', ');

    const months: CalendarMonth[] = [];
    let [y, m] = start.split('-').map(Number);
    const [ey, em] = end.split('-').map(Number);

    while ((y < ey || (y === ey && m <= em)) && months.length < MAX_MONTHS) {
      const first = isoOf(y, m, 1);
      const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const offset = (new Date(toUtcMs(first)).getUTCDay() + 6) % 7; // Monday first
      const days: CalendarDay[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const iso = isoOf(y, m, d);
        const state = marks.get(iso) ?? null;
        const h = heat.get(iso);
        const score = h ? (h.yes.length + h.maybe.length * 0.5) / total : 0;
        const level = (score === 0 ? 0 : Math.min(4, Math.ceil(score * 4))) as CalendarDay['level'];

        let label = dayFmt.format(toUtcMs(iso));
        if (mode === 'mine') {
          if (state) label += `: ${STATE_LABEL[state]}`;
        } else if (h) {
          label += ` – available: ${nameList(h.yes) || 'nobody'}`;
          if (h.maybe.length) label += `; if needed: ${nameList(h.maybe)}`;
        }

        days.push({
          iso,
          day: d,
          disabled: iso < start || iso > end || iso < today,
          isToday: iso === today,
          state,
          level,
          inWindow: !!hl && iso >= hl.start && iso <= hl.end,
          label,
        });
      }

      months.push({ key: first, label: monthFmt.format(toUtcMs(first)), offset, days });
      m++;
      if (m > 12) { m = 1; y++; }
    }
    return months;
  });

  // ---------- painting ----------

  onPointerDown(e: PointerEvent): void {
    if (this.mode() !== 'mine' || e.button !== 0) return;
    const iso = this.dayAt(e);
    if (!iso) return;
    e.preventDefault(); // no text selection / focus jump while dragging

    const brush = this.brush();
    const current = this.marks().get(iso) ?? null;
    this.paintState = brush === 'erase' || current === brush ? null : brush;
    this.apply(iso);
  }

  onPointerMove(e: PointerEvent): void {
    if (this.paintState === undefined) return;
    const iso = this.dayAt(e);
    if (iso) this.apply(iso);
  }

  endPaint(): void {
    this.paintState = undefined;
    this.lastPainted = null;
  }

  /** Keyboard activation only (detail === 0); pointer clicks are handled by pointerdown. */
  onClick(e: MouseEvent, day: CalendarDay): void {
    if (e.detail !== 0 || this.mode() !== 'mine' || day.disabled) return;
    const brush = this.brush();
    this.paint.emit({ day: day.iso, state: brush === 'erase' || day.state === brush ? null : brush });
  }

  private apply(iso: string): void {
    if (iso === this.lastPainted) return;
    this.lastPainted = iso;
    const target = this.paintState ?? null;
    if ((this.marks().get(iso) ?? null) !== target) this.paint.emit({ day: iso, state: target });
  }

  /** Works for touch too: implicit pointer capture keeps events on the first cell, so hit-test manually. */
  private dayAt(e: PointerEvent): string | null {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-iso]');
    if (!el || el.getAttribute('aria-disabled') === 'true') return null;
    return el.dataset['iso'] ?? null;
  }
}