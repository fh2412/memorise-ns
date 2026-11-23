// trip-workspace/trip-ws-header/trip-ws-header.component.ts  (full replacement)
import { Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { BackButtonComponent } from '@components/back-button/back-button.component';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlannedMemory } from '@models/memoryInterface.model';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { diffDays, formatRange, todayIso } from '../date-finder/date-utils';

@Component({
  selector: 'app-trip-ws-header',
  imports: [BackButtonComponent, MatIcon, MatSlideToggle, MatTooltipModule, FormsModule, MatButtonModule],
  templateUrl: './trip-ws-header.component.html',
  styleUrl: './trip-ws-header.component.scss',
})
export class TripWsHeaderComponent {
  plan = input.required<PlannedMemory>();
  currentView = input.required<'corkboard' | 'structured'>();
  /** Only the owner can set or change the destination. */
  isOwner = input(false);

  titleUpdated = output<{ memoryId: string; title: string }>();
  currentViewUpdated = output<{ checked: boolean }>();
  dateFinderRequested = output<void>();
  destinationRequested = output<void>();
  pinRequested = output<void>();

  isEditing = signal(false);
  editValue = signal('');
  titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  dateLabel = computed(() => {
    const p = this.plan();
    return p.memory_date ? formatRange(p.memory_date, p.memory_end_date) : null;
  });

  /** Day-based in the browser's calendar (new Date('YYYY-MM-DD') would be UTC midnight). */
  daysLeft = computed(() => {
    const start = this.plan().memory_date;
    return start ? diffDays(todayIso(), start.slice(0, 10)) : null;
  });

  destination = computed(() => this.plan().destination ?? null);

  constructor() {
    effect(() => {
      const inputEl = this.titleInput();
      if (inputEl) {
        inputEl.nativeElement.focus();
        inputEl.nativeElement.select();
      }
    });
  }

  isUntitled = computed(() => {
    const title = this.plan().title;
    return !title || title.trim() === '';
  });

  displayTitle = computed(() => {
    const currentPlan = this.plan();
    if (currentPlan.title && currentPlan.title.trim() !== '') return currentPlan.title;

    const members = currentPlan.crew_members || [];
    if (members.length > 0) {
      const names = members.map(m => m.name);
      if (names.length <= 2) return `Adventure with ${names.join(' & ')}`;
      return `Adventure with ${names.slice(0, 2).join(', ')} & ${names.length - 2} more`;
    }
    return 'Untitled Adventure';
  });

  startEdit(): void {
    this.editValue.set(this.plan().title || '');
    this.isEditing.set(true);
  }

  saveEdit(): void {
    const updatedTitle = this.editValue().trim();
    if (updatedTitle !== this.plan().title) {
      this.titleUpdated.emit({ memoryId: this.plan().memory_id, title: updatedTitle });
    }
    this.isEditing.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  switchView(checked: boolean): void {
    this.currentViewUpdated.emit({ checked });
  }
}
