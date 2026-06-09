import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
import { Memory } from '@models/memoryInterface.model';
import { MemoryService } from '@services/memory.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@services/userService';

@Component({
  selector: 'app-plans',
  imports: [MatIcon],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
})
export class PlansComponent implements OnInit {

  private userService = inject(UserService);
  private router = inject(Router);
  private memoryService = inject(MemoryService);

  isLoading = false;
  plannedMemories: Memory[] = [];
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
          this.memoryService.getUserCreatedAndAddedMemories(
            this.loggedInUserId,
            true,
            0,
            10,
            'future'
          )
        );

        this.plannedMemories = result.data || [];
      } catch (error) {
        console.error('Error loading planned memories:', error);
      } finally {
        this.isLoading = false;
        console.log(this.plannedMemories);
      }
    }
  }

  onPlanWithFriends() {
    this.router.navigate(['/plans/start/crew']);
  }

}
