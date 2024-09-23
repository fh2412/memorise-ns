import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/userService';
import { ManageFriendsService } from '../../services/friend-manage.service';

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

  constructor(private userService: UserService, private manageFriedService: ManageFriendsService) {}

  async requestFriend(friend: any, methode: string, req: boolean) {
    this.loggedInUserId = await this.userService.getLoggedInUserId();
    if(methode == "Accept"){
      this.manageFriedService.acceptFriendRequest(friend.user_id, this.loggedInUserId);
    }
    else if(methode == "Remove" && req == false){
      this.manageFriedService.removeFriend(friend.user_id, this.loggedInUserId);
    }
    else if(methode == "Remove" && req == true){
      this.manageFriedService.addFriendRequest(friend.user_id, this.loggedInUserId);
    }
    else if(methode == "Request" && req == true){
      this.manageFriedService.removeFriend(friend.user_id, this.loggedInUserId);
    }
    else if(methode == "Request" && req == false){
      this.manageFriedService.sendFriendRequest(friend.user_id, this.loggedInUserId);
    }
    this.requested = !this.requested;
  }
}
