import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  get formattedDob(): string {
    if (!this.friend?.dob) {
      return "dob";
    }
    const dateObj = new Date(this.friend.dob);
    return dateObj.toLocaleDateString('en-GB', { year: 'numeric', day: '2-digit', month: '2-digit' });
  }
  @Output() buttonClicked = new EventEmitter<void>();
  loggedInUserId: any;

  constructor(private friendshipService: FriendsService, private userService: UserService) {}

  async requestFriend(friend: any, methode: string, req: boolean) {
    console.log(friend);
    this.loggedInUserId = await this.userService.getLoggedInUserId();
    if(methode == "Remove from Memory"){
      this.onButtonClick();
    }
    else if(methode == "Accept"){
      this.acceptFriendRequest(friend.user_id, this.loggedInUserId);
      console.log("Accept");
    }
    else if(methode == "Remove" && req == false){
      this.removeFriend(friend.user_id, this.loggedInUserId);
      console.log("Remove");
    }
    else if(methode == "Remove" && req == true){
      this.addFriendRequest(friend.user_id, this.loggedInUserId);
    }
    else if(methode == "Request" && req == true){
      this.removeFriend(friend.user_id, this.loggedInUserId);
    }
    else if(methode == "Request" && req == false){
      this.sendFriendRequest(friend.user_id, this.loggedInUserId);
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

  sendFriendRequest(receiverId: string, senderId: string) {
    this.friendshipService.sendFriendRequest(senderId, receiverId).subscribe(
      response => {
        console.log('Friend request sent successfully', response);
      },
      error => {
        console.error('Error sending friend request', error);
      }
    );
  }

  addFriendRequest(receiverId: string, senderId: string) {
    this.friendshipService.addFriendRequest(senderId, receiverId).subscribe(
      response => {
        console.log('Friend request sent successfully', response);
      },
      error => {
        console.error('Error sending friend request', error);
      }
    );
  }

  onButtonClick(): void {
    this.buttonClicked.emit(this.friend);
  }
}
