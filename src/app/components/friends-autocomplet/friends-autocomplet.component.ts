import {Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject} from '@angular/core';
import {FormControl } from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { FriendsService } from '../../services/friends.service';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-friends-autocomplet',
  templateUrl: './friends-autocomplet.component.html',
  styleUrl: './friends-autocomplet.component.css'
})
export class FriendsAutocompletComponent {
  allfriends: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  separatorKeysCodes: number[] = [];
  friendCtrl = new FormControl('');
  filteredfriends: Observable<string[]> | undefined;
  friends: string[] = [];
  @Input() memoryId = "0";

  @Output() selectedValuesChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  @ViewChild('friendInput') friendInput: ElementRef<HTMLInputElement> | any;

  announcer = inject(LiveAnnouncer);

  loggedInUserId: string | any;

  async getFriends() {
    try {
      this.loggedInUserId = await this.userService.getLoggedInUserId();
      this.friendsService.getMemoriesMissingFriends(this.memoryId, this.loggedInUserId).subscribe(
        (friends) => {
          this.allfriends = friends.map(item => `${item.name} (${item.email})`);
          
          // Move the logic that depends on this.allfriends here
          this.filteredfriends = this.friendCtrl.valueChanges.pipe(
            startWith(null),
            map((friend: string | null) => {
              const filterValue = friend ? friend.toLowerCase() : '';
              return this.allfriends
                .filter((f) => f.toLowerCase().includes(filterValue) && !this.friends.includes(f));
            })
          );
        },
        (error) => {
          console.error('Error fetching user friends:', error);
        }
      );
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  }
  
  async ngOnInit() {
    await this.getFriends();
  }
  
  constructor(private friendsService: FriendsService, private userService: UserService) {
    this.ngOnInit();
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our friend
    if (value) {
      this.friends.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.friendCtrl.setValue(null);
  }

  remove(friend: string): void {
    const index = this.friends.indexOf(friend);

    if (index >= 0) {
      this.friends.splice(index, 1);

      this.announcer.announce(`Removed ${friend}`);
    }
    this.selectedValuesChange.emit(this.friends);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.friends.push(event.option.viewValue);
    this.friendInput.nativeElement.value = '';
    this.friendCtrl.setValue(null);
    this.selectedValuesChange.emit(this.friends);
  }
}
