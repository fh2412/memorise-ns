import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { UserService } from '@services/userService';
import { Friend } from '@models/userInterface.model';
import { debounceTime, Subject } from 'rxjs';
import { FriendsService } from '@services/friends.service';

@Component({
    selector: 'app-friend-search',
    templateUrl: './friend-search.component.html',
    styleUrls: ['./friend-search.component.scss'],
    standalone: false
})
export class FriendSearchComponent implements OnInit {
  private searchService = inject(UserService);
  private friendsService = inject(FriendsService);
  private cdRef = inject(ChangeDetectorRef);

  @Input() userId: string | null = null;

  searchTerm = '';
  searchResults: Friend[] = [];
  enter = false;
  errorMessage = '';
  initState = true;
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => this.searchFriend());
  }

  ngOnInit(): void {
    this.getSuggestedFriends(this.userId);
  }

  onSearchTermChange(term: string): void {
    this.initState = false;
    this.searchTerm = term;
    this.searchSubject.next(term);
    this.cdRef.detectChanges();
  }

searchFriend(): void {
  if (!this.searchTerm) {
    this.searchResults = [];
    return;
  }
  
  if (this.userId != null) {
    this.enter = true;
    this.searchResults = [];
    
    this.searchService.searchUsers(this.searchTerm, this.userId).subscribe(
      (results) => {
        this.searchResults = results;
        this.errorMessage = '';
      },
      (error) => {
        console.error('Error searching for friends:', error);
        this.errorMessage = 'Failed to fetch search results. Please try again.';
        this.searchResults = [];
      }
    );
  }
}

  getSuggestedFriends(userId: string | null) {
    if(userId){
      this.friendsService.getFriendSuggestions(userId).subscribe({
          next: (result) => {
            console.log("Suggested Friends: ", result);
            this.searchResults = result;
          },
          error: (error) => {
              console.error('Error toggling bookmark', error);
          }
        });
    }
  }
}
