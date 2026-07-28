import { Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { BackButtonComponent } from "@components/back-button/back-button.component";
import { MatIcon } from "@angular/material/icon";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { PlannedMemory } from '@models/memoryInterface.model';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-trip-ws-header',
  imports: [BackButtonComponent, MatIcon, MatSlideToggle, FormsModule, MatButtonModule],
  templateUrl: './trip-ws-header.component.html',
  styleUrl: './trip-ws-header.component.scss',
})
export class TripWsHeaderComponent {

  plan = input.required<PlannedMemory>();
  currentView = input.required<'corkboard' | 'structured'>();
  titleUpdated = output<{ memoryId: string; title: string }>();
  currentViewUpdated = output<{checked: boolean}>();

  isEditing = signal(false);
  editValue = signal('');
  titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  constructor() {
    // 3. This effect automatically runs whenever the 'titleInput' signal changes
    effect(() => {
      const inputEl = this.titleInput();
      if (inputEl) {
        inputEl.nativeElement.focus();

        // Bonus UX Pro-Tip: .select() highlights the existing text 
        // so the user can immediately overwrite it if they want to!
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
    if (currentPlan.title && currentPlan.title.trim() !== '') {
      return currentPlan.title;
    }

    const members = currentPlan.crew_members || [];
    if (members.length > 0) {
      const names = members.map(m => m.name);
      if (names.length <= 2) return `Adventure with ${names.join(' & ')}`;
      return `Adventure with ${names.slice(0, 2).join(', ')} & ${names.length - 2} more`;
    }

    return 'Untitled Adventure';
  });

  // Activate inline editing mode
  startEdit(): void {
    // Fall back to empty string if it's currently using the system generated naming
    this.editValue.set(this.plan().title || '');
    this.isEditing.set(true);
  }

  // Save changes and emit to the parent orchestration container
  saveEdit(): void {
    const updatedTitle = this.editValue().trim();
    if (updatedTitle !== this.plan().title) {
      this.titleUpdated.emit({
        memoryId: this.plan().memory_id,
        title: updatedTitle
      });
    }
    this.isEditing.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  switchView(checked: boolean): void {
    this.currentViewUpdated.emit({
      checked: checked
    });
  }

  manageDates() {
    alert('Mock Action: Open interactive calendar sheet or change trip length.');
  }
}
