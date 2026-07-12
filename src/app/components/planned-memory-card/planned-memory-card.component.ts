import { Component, computed, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlannedMemory } from '@models/memoryInterface.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planned-memory-card',
  standalone: true,
  imports: [MatIcon, DatePipe, NgClass, FormsModule],
  templateUrl: './planned-memory-card.component.html',
  styleUrl: './planned-memory-card.component.scss',
})
export class PlannedMemoryCardComponent {
  private router = inject(Router);

  plan = input.required<PlannedMemory>();
  titleUpdated = output<{ memoryId: string; title: string }>();

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

  navigateToWorkspace(): void {
    // Prevent navigating if the user is currently typing a new name
    //if (this.isEditing()) return;

    this.router.navigate(['plans/trip-workspace', this.plan().memory_id]);
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

  creatorName = computed(() => {
    const creator = this.plan().crew_members?.find(m => m.isCreator);
    return creator ? creator.name : 'Organized Trip';
  });

  crewPreview = computed(() => {
    return this.plan().crew_members?.slice(0, 4) || [];
  });

  // Activate inline editing mode
  startEdit(): void {
    // Fall back to empty string if it's currently using the system generated naming
    this.editValue.set(this.plan().title || '');
    this.isEditing.set(true);
  }

  // Save changes and emit to the parent orchestration container
  saveEdit(): void {
    console.log("New Title: ", this.editValue().trim());
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
}