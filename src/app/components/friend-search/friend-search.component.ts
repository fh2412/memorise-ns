import { Component } from '@angular/core';

@Component({
  selector: 'app-friend-search',
  templateUrl: './friend-search.component.html',
  styleUrl: './friend-search.component.scss'
})
export class FriendSearchComponent {
  searchTerm = '';

  searchFriend() {
    // Implement your search logic here
    console.log('Search term:', this.searchTerm);
  }
}
