import { Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@services/userService';
import { MemoryService } from '@services/memory.service';
import { CrewSelectorComponent } from '@components/crew-selector/crew-selector.component';
import { CrewMember } from '@models/userInterface.model';
import { describeCreateMemoryError, toCrewPayload } from 'app/utils/memory-create.mapper';

@Component({
  selector: 'app-plan-crew',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CrewSelectorComponent,
  ],
  templateUrl: './plan-crew.component.html',
  styleUrl: './plan-crew.component.scss',
})
export class PlanCrewComponent {
  private readonly userService = inject(UserService);
  private readonly memoryService = inject(MemoryService);
  private readonly location = inject(Location);

  readonly memoryTitle = signal('');
  readonly selectedCrew = signal<CrewMember[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly emptyTitle = computed(() => this.memoryTitle().trim().length > 0 && !this.saving());

  /** One id per form → a retry after a lost response returns the same memory instead of a duplicate. */
  private readonly requestId = crypto.randomUUID();

  async startPlanningMemory(): Promise<void> {
    if (!this.emptyTitle()){
      this.memoryTitle.set('');
    };

    this.saving.set(true);
    this.error.set(null);

    try {
      // Planned memory: no dates, no location, no photos → backend uses the "none" defaults.
      await firstValueFrom(
        this.memoryService.create({
          requestId: this.requestId,
          title: this.memoryTitle().trim(),
          crew: toCrewPayload(this.selectedCrew(), this.userService.getLoggedInUserId()),
        }),
      );
      this.location.back();
    } catch (err) {
      this.error.set(describeCreateMemoryError(err));
    } finally {
      this.saving.set(false);
    }
  }
}
