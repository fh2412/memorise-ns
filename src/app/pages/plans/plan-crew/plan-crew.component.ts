import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Friend } from '@models/userInterface.model';
import { UserService } from '@services/userService';
import { firstValueFrom } from 'rxjs';
import { FriendsService } from '@services/friends.service';
import { MemoryService } from '@services/memory.service';
import { MemoryFormData } from '@models/memoryInterface.model';

export interface CrewMember {
  user_id: string;
  name: string;
  profilepic: string | null;
  sharedMemoriesCount: number;
  isPlaceholder: boolean;
  email: string;
}

@Component({
  selector: 'app-plan-crew',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './plan-crew.component.html',
  styleUrl: './plan-crew.component.scss'
})
export class PlanCrewComponent implements OnInit {

  private readonly userService = inject(UserService);
  private readonly friendsService = inject(FriendsService);
  private readonly memoryService = inject(MemoryService);
  private location = inject(Location);


  // Input search string via Signal
  searchQuery = signal<string>('');

  friendsList = signal<Friend[]>([]);

  loggedInUserId: string | null = null;



  // Track the currently selected trip squad
  selectedCrew = signal<CrewMember[]>([]);

  // Computed signal to provide quick suggestions (Top travelers not yet selected)
  frequentSuggestions = computed(() => {
    const crewIds = new Set(this.selectedCrew().map(c => c.user_id));
    return this.friendsList()
      .filter(f => !crewIds.has(f.user_id))
      .sort((a, b) => b.sharedMemoriesCount - a.sharedMemoriesCount)
      .slice(0, 3);
  });

  // Computed signal for active inline search results
  filteredFriends = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];

    const crewIds = new Set(this.selectedCrew().map(c => c.user_id));
    return this.friendsList().filter(f =>
      !crewIds.has(f.user_id) && f.name.toLowerCase().includes(query)
    );
  });

  // Check if current search phrase exactly matches any existing friend or crew member
  showPlaceholderOption = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return false;

    const exactFriendMatch = this.friendsList().some(f => f.name.toLowerCase() === query);
    const exactCrewMatch = this.selectedCrew().some(c => c.name.toLowerCase() === query);

    return !exactFriendMatch && !exactCrewMatch;
  });

  async ngOnInit(): Promise<void> {
    this.loggedInUserId = this.userService.getLoggedInUserId() || '';
    if (this.loggedInUserId) {
      await this.fetchFriends(this.loggedInUserId);
    }
  }

  private async fetchFriends(userId: string): Promise<void> {
    try {
      this.friendsList.set(await firstValueFrom(this.friendsService.getUserFriendsWithShared(userId)));
    } catch (error) {
      console.error(`error fetching friends:`, error);
    }
  }

  addFriendToCrew(friend: Friend): void {
    const member: CrewMember = {
      user_id: friend.user_id,
      name: friend.name,
      profilepic: friend.profilepic,
      sharedMemoriesCount: friend.sharedMemoriesCount,
      email: friend.email,
      isPlaceholder: false
    };

    this.selectedCrew.update(crew => [...crew, member]);
    this.searchQuery.set('');
  }

  addPlaceholderToCrew(): void {
    const name = this.searchQuery().trim();
    if (!name) return;

    const placeholder: CrewMember = {
      user_id: `placeholder_${Date.now()}`,
      name: name,
      profilepic: null,
      sharedMemoriesCount: 0,
      email: 'example@gmail.com',
      isPlaceholder: true
    };

    this.selectedCrew.update(crew => [...crew, placeholder]);
    this.searchQuery.set('');
  }

  removeCrewMember(id: string): void {
    this.selectedCrew.update(crew => crew.filter(m => m.user_id !== id));
  }

  async startPlanningMemory() {
    //Create new Memory
    const tempMemory: MemoryFormData = {
      creator_id: this.loggedInUserId || '',
      title: '',
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
    }
    const memResponse = await firstValueFrom(this.memoryService.createMemory(tempMemory));


    //Add Friends to Memory
    const selectedCrewEmails: string[] = this.selectedCrew().map(friend => friend.email);
    await firstValueFrom(this.memoryService.addFriendToMemory({
      emails: selectedCrewEmails,
      memoryId: memResponse.memory_id
    }));


    //Navigate to Planning Page
    this.location.back();
  }
}