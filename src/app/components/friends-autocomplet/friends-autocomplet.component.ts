import { Component, ElementRef, ViewChild, inject, OnInit, input, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { firstValueFrom, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FriendsService } from '@services/friends.service';
import { UserService } from '@services/userService';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Friend } from '@models/userInterface.model';

@Component({
  selector: 'app-friends-autocomplet',
  templateUrl: './friends-autocomplet.component.html',
  styleUrls: ['./friends-autocomplet.component.scss'],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    FormsModule,
    MatChipsModule,
  ]
})
export class FriendsAutocompletComponent implements OnInit {
  private friendsService = inject(FriendsService);
  private userService = inject(UserService);

  allfriends: Friend[] = [];
  friendCtrl = new FormControl<string | Friend | null>('');
  filteredfriends: Observable<Friend[]> | undefined;
  friends: Friend[] = [];

  readonly memoryId = input("0");
  readonly selectedValuesChange = output<Friend[]>();
  @ViewChild('friendInput') friendInput!: ElementRef<HTMLInputElement>;

  announcer = inject(LiveAnnouncer);
  loggedInUserId: string | null = null;

  async ngOnInit(): Promise<void> {
    await this.initializeFriendsList();
  }

  private async initializeFriendsList() {
    try {
      this.loggedInUserId = await this.userService.getLoggedInUserId();

      if (this.loggedInUserId) {
        this.allfriends = await firstValueFrom(
          this.friendsService.getMemoriesMissingFriends(this.memoryId(), this.loggedInUserId)
        );

        this.setFilteredFriends();
      }
    } catch (error) {
      console.error('Error initializing friends list:', error);
    }
  }

  private setFilteredFriends() {
    this.filteredfriends = this.friendCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : value?.name?.toLowerCase() || '';

        return this.allfriends.filter(f => {
          const isNotSelected = !this.friends.some(selected => selected.user_id === f.user_id);
          const matchesFilter = f.name.toLowerCase().includes(filterValue) || f.email.toLowerCase().includes(filterValue);
          return isNotSelected && matchesFilter;
        });
      })
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim().toLowerCase();

    if (value) {
      // Find matching friend from available unselected options by email or name
      const matchingFriend = this.allfriends.find(
        f => (f.email.toLowerCase() === value || f.name.toLowerCase() === value) &&
          !this.friends.some(selected => selected.user_id === f.user_id)
      );

      if (matchingFriend) {
        this.friends.push(matchingFriend);
        this.selectedValuesChange.emit(this.friends);
        this.announcer.announce(`Added ${matchingFriend.name}`);
      }
    }

    event.chipInput!.clear();
    this.friendCtrl.setValue('');
  }

  remove(friend: Friend): void {
    const index = this.friends.findIndex(f => f.user_id === friend.user_id);
    if (index >= 0) {
      this.friends.splice(index, 1);
      this.announcer.announce(`Removed ${friend.name}`);
      this.selectedValuesChange.emit(this.friends);
      // Re-trigger control value changes to update filtered options
      this.friendCtrl.setValue(this.friendCtrl.value);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedFriend = event.option.value as Friend;

    if (selectedFriend && !this.friends.some(f => f.user_id === selectedFriend.user_id)) {
      this.friends.push(selectedFriend);
      this.selectedValuesChange.emit(this.friends);
      this.announcer.announce(`Added ${selectedFriend.name}`);
    }

    if (this.friendInput) {
      this.friendInput.nativeElement.value = '';
    }
    this.friendCtrl.setValue('');
  }
}
