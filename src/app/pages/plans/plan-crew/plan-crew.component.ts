import { Component, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '@services/userService';
import { firstValueFrom } from 'rxjs';
import { MemoryService } from '@services/memory.service';
import { MemoryFormData } from '@models/memoryInterface.model';
import { CrewSelectorComponent } from '@components/crew-selector/crew-selector.component';
import { CrewMember } from '@models/userInterface.model';

@Component({
  selector: 'app-plan-crew',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CrewSelectorComponent
],
  templateUrl: './plan-crew.component.html',
  styleUrl: './plan-crew.component.scss'
})
export class PlanCrewComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly memoryService = inject(MemoryService);
  private location = inject(Location);

  memoryTitle = signal<string>('');
  selectedCrew = signal<CrewMember[]>([]);
  loggedInUserId: string | null = null;

  ngOnInit(): void {
    this.loggedInUserId = this.userService.getLoggedInUserId() || '';
  }

  async startPlanningMemory() {
    const tempMemory: MemoryFormData = {
      creator_id: this.loggedInUserId || '',
      title: this.memoryTitle().trim(),
      description: '',
      firestore_bucket_url: '',
      memory_date: null,
      memory_end_date: null,
      title_pic: '',
      location_id: 1,
      lng: '',
      lat: '',
      l_country: '',
      l_countryCode: '',
      l_city: '',
      l_postcode: '',
      quickActivityTitle: '',
      activity_id: 1
    };
    
    const memResponse = await firstValueFrom(this.memoryService.createMemory(tempMemory));

    // Add Friends to Memory
    const selectedCrewIds: string[] = this.selectedCrew().map(friend => friend.user_id);
    await firstValueFrom(this.memoryService.addFriendToMemory({
      friendIds: selectedCrewIds,
      memoryId: memResponse.memory_id
    }));

    // Navigate to Planning Page
    this.location.back();
  }
}