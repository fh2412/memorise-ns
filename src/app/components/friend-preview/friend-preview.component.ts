import { Component, Input } from '@angular/core';
import { FriendsService } from '../../services/friends.service';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-friend-preview',
  templateUrl: './friend-preview.component.html',
  styleUrl: './friend-preview.component.scss'
})
export class FriendPreviewComponent {
  @Input() requested: boolean = false;
  @Input() buttonText: string = 'Request';
  @Input() requestedText: string = 'Requested';
  @Input() buttonColor: string = 'primary'; // Use MatButton color options (primary, accent, warn, etc.)
  @Input() buttonIcon: string = 'person_add'; // Use MatButton icon options
  @Input() friend: any;
  loggedInUserId: any;

  constructor(private friendshipService: FriendsService, private userService: UserService) {}

  async requestFriend(friend: any, methode: string, req: boolean) {
    this.loggedInUserId = await this.userService.getLoggedInUserId();
    if(methode == "Accept"){
      this.acceptFriendRequest(friend.user_id, this.loggedInUserId);
    }
    if(methode == "Remove"){
      this.removeFriend(friend.user_id, this.loggedInUserId);
    }
    if(methode == "Request" && req == true){
      this.removeFriend(friend.user_id, this.loggedInUserId);
    }
    this.requested = !this.requested;
  }

  acceptFriendRequest(userId1: string, userId2: string) {
    this.friendshipService.acceptFriendRequest(userId1, userId2).subscribe(
      response => {
        console.log('Friend request accepted successfully', response);
      },
      error => {
        console.error('Error accepting friend request', error);
      }
    );
  }

  removeFriend(userId1: string, userId2: string) {
    this.friendshipService.removeFriend(userId1, userId2).subscribe(
      response => {
        console.log('Friend removed successfully', response);
      },
      error => {
        console.error('Error removing friend', error);
      }
    );
  }
}
