import { Component, Input } from '@angular/core';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-friend-search',
  templateUrl: './friend-search.component.html',
  styleUrl: './friend-search.component.scss'
})
export class FriendSearchComponent {

  @Input() userId: string="";

  constructor(private searchService: UserService) { }
  searchTerm = '';
  searchResults: any[] = [];
  enter: boolean = false;


  searchFriend() {
    if (!this.searchTerm) {
      return;
    }
    this.enter = true;

    this.searchService.searchUsers(this.searchTerm, this.userId)
      .subscribe(results => {
        this.searchResults = results;
      }, error => {
        console.error(error);
        // Handle errors (display error message to the user)
      });
  }
}
