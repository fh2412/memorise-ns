import { Component, computed, inject, signal, OnInit, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Friend } from '@models/userInterface.model';
import { UserService } from '@services/userService';
import { FriendsService } from '@services/friends.service';
import { firstValueFrom } from 'rxjs';
import { CrewAvatarComponent } from "@components/crew-avatar/crew-avatar.component";

export interface CrewMember {
  user_id: string;
  name: string;
  profilepic: string | null;
  sharedMemoriesCount: number;
  isPlaceholder: boolean;
  email: string;
}

@Component({
  selector: 'app-crew-selector',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    CrewAvatarComponent
  ],
  templateUrl: './crew-selector.component.html',
  styleUrl: './crew-selector.component.scss'
})
export class CrewSelectorComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly friendsService = inject(FriendsService);

  // model() enables two-way data binding with the parent component [(crew)]="mySignal"
  crew = model<CrewMember[]>([]);

  searchQuery = signal<string>('');
  friendsList = signal<Friend[]>([]);

  frequentSuggestions = computed(() => {
    const crewIds = new Set(this.crew().map(c => c.user_id));
    return this.friendsList()
      .filter(f => !crewIds.has(f.user_id))
      .sort((a, b) => b.sharedMemoriesCount - a.sharedMemoriesCount)
      .slice(0, 3);
  });

  filteredFriends = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];

    const crewIds = new Set(this.crew().map(c => c.user_id));
    return this.friendsList().filter(f =>
      !crewIds.has(f.user_id) && f.name.toLowerCase().includes(query)
    );
  });

  showPlaceholderOption = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return false;

    const exactFriendMatch = this.friendsList().some(f => f.name.toLowerCase() === query);
    const exactCrewMatch = this.crew().some(c => c.name.toLowerCase() === query);

    return !exactFriendMatch && !exactCrewMatch;
  });

  async ngOnInit(): Promise<void> {
    const loggedInUserId = this.userService.getLoggedInUserId() || '';
    if (loggedInUserId) {
      await this.fetchFriends(loggedInUserId);
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

    this.crew.update(c => [...c, member]);
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

    this.crew.update(c => [...c, placeholder]);
    this.searchQuery.set('');
  }

  removeCrewMember(id: string): void {
    this.crew.update(c => c.filter(m => m.user_id !== id));
  }
}