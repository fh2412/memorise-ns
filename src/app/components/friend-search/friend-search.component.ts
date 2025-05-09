import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { UserService } from '../../services/userService';
import { Friend } from '../../models/userInterface.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
    selector: 'app-friend-search',
    templateUrl: './friend-search.component.html',
    styleUrls: ['./friend-search.component.scss'],
    standalone: false
})
export class FriendSearchComponent {
  @Input() userId: string | null = null;

  searchTerm = '';
  searchResults: Friend[] = [];
  enter = false;
  errorMessage = '';
  private searchSubject = new Subject<string>();

  constructor(private searchService: UserService, private cdRef: ChangeDetectorRef) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => this.searchFriend());
  }

  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
    this.cdRef.detectChanges();
  }

  searchFriend(): void {
    if (!this.searchTerm) return;
    else if (this.userId != null) {
      this.enter = true;
      this.searchService.searchUsers(this.searchTerm, this.userId).subscribe(
        (results) => {
          this.searchResults = results;
          console.log(this.searchResults);
          this.errorMessage = ''; // Clear error on successful response
        },
        (error) => {
          console.error('Error searching for friends:', error);
          this.errorMessage = 'Failed to fetch search results. Please try again.';
        }
      );
    }
  }
}
