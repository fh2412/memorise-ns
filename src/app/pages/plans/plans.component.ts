import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
import { PlannedMemory } from '@models/memoryInterface.model';
import { MemoryService } from '@services/memory.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@services/userService';
import { PlannedMemoryCardComponent } from "@components/planned-memory-card/planned-memory-card.component";

@Component({
  selector: 'app-plans',
  imports: [MatIcon, PlannedMemoryCardComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
})
export class PlansComponent implements OnInit {

  private userService = inject(UserService);
  private router = inject(Router);
  private memoryService = inject(MemoryService);

  isLoading = false;
  plannedMemories = signal<PlannedMemory[]>([]);
  loggedInUserId: string | null = null;


  async ngOnInit(): Promise<void> {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    try {
      await this.loadMemoriesPage();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  private async loadMemoriesPage(): Promise<void> {
    /*if (this.isSearchActive) {
      // If search is active, filter from cached results
      this.filterFromCache();
      return;
    }*/

    this.isLoading = true;

    if (this.loggedInUserId) {
      try {
        const result = await firstValueFrom(
          this.memoryService.getUserPlannedMemories(
            this.loggedInUserId,
          )
        );

        this.plannedMemories.set(result);
        console.log(this.plannedMemories);
      } catch (error) {
        console.error('Error loading planned memories:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  handleTitleUpdate(event: { memoryId: string; title: string }) {
    // 1. Optimistically update local state so the UI feels instant
    this.plannedMemories.update(memories => 
      memories.map(m => m.memory_id === event.memoryId ? { ...m, title: event.title } : m)
    );

    // 2. Fire and forget the backend API update call
    this.memoryService.updateMemoryTitle(event.memoryId, event.title).subscribe({
      error: (err) => {
        // If the API fails, roll back state or show a toast notification
        console.error('Failed to save title backend side:', err);
      }
    });
  }

  onPlanWithFriends() {
    this.router.navigate(['/plans/start/crew']);
  }

}
