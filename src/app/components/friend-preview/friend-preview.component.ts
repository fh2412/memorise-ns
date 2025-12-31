import { Component, HostListener, Input, OnInit, inject, input, output } from '@angular/core';
import { UserService } from '@services/userService';
import { ManageFriendsService } from '@services/friend-manage.service';
import { Friend } from '@models/userInterface.model';
import { Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-friend-preview',
  templateUrl: './friend-preview.component.html',
  styleUrl: './friend-preview.component.scss',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
  ],
})
export class FriendPreviewComponent implements OnInit {
  private userService = inject(UserService);
  private manageFriendsService = inject(ManageFriendsService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() requested = false;
  readonly buttonText = input('Request');
  readonly requestedText = input('Requested');
  readonly buttonColor = input('primary');
  readonly buttonIcon = input('person_add');
  readonly declineButton = input(false);
  readonly friend = input.required<Friend>();

  readonly buttonClicked = output<void>();
  readonly friendRequestProcessed = output<{
    friendId: string;
    action: 'accepted' | 'declined';
}>();

  loggedInUserId: string | null = null;
  isLargeScreen = true;

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
          await this.manageFriendsService.acceptFriendRequest(this.friend().user_id.toString(), this.loggedInUserId);
        } else if (action === 'Remove') {
          if (req) {
            await this.manageFriendsService.addFriendRequest(this.friend().user_id.toString(), this.loggedInUserId);
          } else {
            await this.manageFriendsService.removeFriend(this.friend().user_id.toString(), this.loggedInUserId);
          }
        } else if (action === 'Request') {
          if (req) {
            await this.manageFriendsService.removeFriend(this.friend().user_id.toString(), this.loggedInUserId);
          } else {
            await this.manageFriendsService.sendFriendRequest(this.friend().user_id.toString(), this.loggedInUserId);
          }
        }
      }
      this.requested = !this.requested;
      // TODO: The 'emit' function requires a mandatory void argument
      this.buttonClicked.emit();  // Emit the button click event for parent components to listen to

    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  }

async acceptFriendRequest(): Promise<void> {
    this.loggedInUserId = await this.userService.getLoggedInUserId();
    if (this.loggedInUserId != null) {
      await this.manageFriendsService.acceptFriendRequest(this.friend().user_id.toString(), this.loggedInUserId);
      
      this.snackBar.open("You have a new Friend!", 'Hurray!', { duration: 3000, verticalPosition: 'bottom' });

      // Emit event to parent after successful acceptance
      this.friendRequestProcessed.emit({ 
        friendId: this.friend().user_id.toString(), 
        action: 'accepted' 
      });
    }
  }

  async declineFriendRequest(): Promise<void> {
    this.loggedInUserId = await this.userService.getLoggedInUserId();
    if (this.loggedInUserId != null) {
      await this.manageFriendsService.removeFriend(this.friend().user_id.toString(), this.loggedInUserId);

      this.snackBar.open("You declined a Request!", 'OK', { duration: 3000, verticalPosition: 'bottom' });

      this.friendRequestProcessed.emit({ 
        friendId: this.friend().user_id.toString(), 
        action: 'declined' 
      });
    }
  }

  navigateToUserpage(friendId: string) {
    this.router.navigate(['user/', friendId]);
  }
}
