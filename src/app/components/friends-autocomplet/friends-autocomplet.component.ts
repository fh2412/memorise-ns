import { Component, ElementRef, ViewChild, inject, OnInit, input, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';
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

  allfriends: string[] = [];
  friendCtrl = new FormControl('');
  filteredfriends: Observable<string[]> | undefined;
  friends: string[] = [];

  readonly memoryId = input("0");
  readonly selectedValuesChange = output<string[]>();
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
        this.friendsService.getMemoriesMissingFriends(this.memoryId(), this.loggedInUserId).subscribe(
          (friends) => {
            this.allfriends = friends.map(item => `${item.name} (${item.email})`);
            this.setFilteredFriends();
          },
          (error) => {
            console.error('Error fetching user friends:', error);
          }
        );
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  }

  private setFilteredFriends() {
    this.filteredfriends = this.friendCtrl.valueChanges.pipe(
      startWith(null),
      map((friend: string | null) => {
        const filterValue = friend ? friend.toLowerCase() : '';
        return this.allfriends.filter(f => f.toLowerCase().includes(filterValue) && !this.friends.includes(f));
      })
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.friends.includes(value)) {
      this.friends.push(value);
      this.selectedValuesChange.emit(this.friends);
      this.announcer.announce(`Added ${value}`);
    }
    event.chipInput!.clear();
    this.friendCtrl.setValue(null);
  }

  remove(friend: string): void {
    const index = this.friends.indexOf(friend);
    if (index >= 0) {
      this.friends.splice(index, 1);
      this.announcer.announce(`Removed ${friend}`);
      this.selectedValuesChange.emit(this.friends);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const friend = event.option.viewValue;
    if (!this.friends.includes(friend)) {
      this.friends.push(friend);
      this.selectedValuesChange.emit(this.friends);
      this.announcer.announce(`Added ${friend}`);
    }
    if (this.friendInput) {
      this.friendInput.nativeElement.value = '';
    }
    this.friendCtrl.setValue(null);
  }
}
