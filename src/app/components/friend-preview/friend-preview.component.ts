import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/userService';
import { ManageFriendsService } from '../../services/friend-manage.service';
import { Friend } from '../../models/userInterface.model';

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
  @Input() friend!: Friend;

  @Output() buttonClicked = new EventEmitter<void>();
  
  loggedInUserId!: string;

  constructor(private userService: UserService, private manageFriendsService: ManageFriendsService) {}

 
  async requestFriend(action: string, req: boolean): Promise<void> {
    try {
      this.loggedInUserId = await this.userService.getLoggedInUserId() || '';

      if (action === 'Accept') {
        await this.manageFriendsService.acceptFriendRequest(this.friend.user_id.toString(), this.loggedInUserId);
      } else if (action === 'Remove') {
        req 
          ? await this.manageFriendsService.addFriendRequest(this.friend.user_id.toString(), this.loggedInUserId)
          : await this.manageFriendsService.removeFriend(this.friend.user_id.toString(), this.loggedInUserId);
      } else if (action === 'Request') {
        req 
          ? await this.manageFriendsService.removeFriend(this.friend.user_id.toString(), this.loggedInUserId)
          : await this.manageFriendsService.sendFriendRequest(this.friend.user_id.toString(), this.loggedInUserId);
      }

      this.requested = !this.requested;
      this.buttonClicked.emit();  // Emit the button click event for parent components to listen to

    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  }
}
