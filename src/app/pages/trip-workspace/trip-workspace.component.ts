import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@services/userService';
import { firstValueFrom } from 'rxjs';
import { MemoryService } from '@services/memory.service';
import { PlannedMemory } from '@models/memoryInterface.model';
import { LoadingSpinnerComponent } from "@components/loading-spinner/loading-spinner.component";
import { FormsModule } from '@angular/forms';
import { TripWsHeaderComponent } from "./trip-ws-header/trip-ws-header.component";
import { CrewMember } from '@models/userInterface.model';

@Component({
  selector: 'app-trip-workspace',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    NgClass,
    TripWsHeaderComponent
  ],
  templateUrl: './trip-workspace.component.html',
  styleUrls: ['./trip-workspace.component.scss']
})
export class TripWorkspaceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private memoryService = inject(MemoryService);


  // Signal to track the current board view mode
  currentView = signal<'corkboard' | 'structured'>('corkboard');

  // Available "free" colors a new user could pick from
  availableColors = ['#4F378B', '#006874', '#386A20', '#A63E2B', '#005FAF'];

  loggedInUserId: string | null = null;
  memoryId = '';
  isLoading = signal<boolean>(true);
  plannedMemory = signal<PlannedMemory | undefined>(undefined);
  crew = signal<CrewMember[] | undefined>([]);


  async ngOnInit(): Promise<void> {
    this.memoryId = this.route.snapshot.paramMap.get('memoryId') || '';
    this.loggedInUserId = this.userService.getLoggedInUserId();
    try {
      await this.loadMemoriesPage();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  private async loadMemoriesPage(): Promise<void> {
    this.isLoading.set(true);

    if (this.loggedInUserId) {
      try {
        const result = await firstValueFrom(
          this.memoryService.getMemoryToPlan(
            this.memoryId,
          )
        );
        this.plannedMemory.set(result);
        console.log(result);
        this.crew.set(result.crew_members);
      } catch (error) {
        console.error('Error loading planned memories:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  handleTitleUpdate(event: { memoryId: string; title: string }) {
    this.plannedMemory.update(plan => plan ? { ...plan, title: event.title } : plan);

    this.memoryService.updateMemoryTitle(event.memoryId, event.title).subscribe({
      error: (err) => {
        console.error('Failed to save title backend side:', err);
      }
    });
  }

  // "Stupid" buttons dummy actions
  addCrewMember() {
    alert('Mock Action: Open add friend dialogue / Create Placeholder Crew Member.');
  }

  changeMyColor() {
    alert('Mock Action: Cycle through unassigned M3 palette colors.');
  }
}