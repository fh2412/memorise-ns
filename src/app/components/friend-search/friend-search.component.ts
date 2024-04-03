import { Component } from '@angular/core';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-friend-search',
  templateUrl: './friend-search.component.html',
  styleUrl: './friend-search.component.scss'
})
export class FriendSearchComponent {

  constructor(private searchService: UserService) { }
  searchTerm = '';
  searchResults: any[] = [];

  searchFriend() {
    if (!this.searchTerm) {
      return;
    }

    this.searchService.searchUsers(this.searchTerm)
      .subscribe(results => {
        this.searchResults = results;
      }, error => {
        console.error(error);
        // Handle errors (display error message to the user)
      });
  }
}
