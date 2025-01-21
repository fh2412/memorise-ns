import { Component, EventEmitter, HostListener, Input, Output, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { ManageFriendsService } from '../../services/friend-manage.service';
import { Friend } from '../../models/userInterface.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friend-preview',
  templateUrl: './friend-preview.component.html',
  styleUrl: './friend-preview.component.scss'
})
export class FriendPreviewComponent implements OnInit {
  @Input() requested = false;
  @Input() buttonText = 'Request';
  @Input() requestedText = 'Requested';
  @Input() buttonColor = 'primary'; // Use MatButton color options (primary, accent, warn, etc.)
  @Input() buttonIcon = 'person_add'; // Use MatButton icon options
  @Input() friend!: Friend;

  @Output() buttonClicked = new EventEmitter<void>();

  loggedInUserId: string | null = null;
  isLargeScreen = true;

  constructor(private userService: UserService, private manageFriendsService: ManageFriendsService, private router: Router) { }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.isLargeScreen = window.innerWidth > 1500;
  }

  ngOnInit() {
    this.onResize(); // Check initial screen size
  }

  async requestFriend(action: string, req: boolean): Promise<void> {
    try {
      this.loggedInUserId = await this.userService.getLoggedInUserId();
      if (this.loggedInUserId != null) {
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
      }
      this.requested = !this.requested;
      this.buttonClicked.emit();  // Emit the button click event for parent components to listen to

    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  }

  navigateToUserpage(friendId: string) {
    this.router.navigate(['user/', friendId]);
  }
}
