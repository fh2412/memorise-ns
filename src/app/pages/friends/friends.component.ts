import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FriendsService } from '../../services/friends.service';
import { UserService } from '../../services/userService';
import { ShareFriendCodeDialogComponent } from '../../components/_dialogs/share-friend-code-dialog/share-friend-code-dialog.component';
import { Friend } from '../../models/userInterface.model';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent implements OnInit {
  friends: Friend[] = [];
  pendingFriends: Friend[] = [];
  ingoingFriends: Friend[] = [];
  loggedInUserId: string | null = null;

  constructor(
    private dialog: MatDialog,
    private friendsService: FriendsService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.initializeUserData();
  }

  private initializeUserData(): void {
    this.loggedInUserId = this.userService.getLoggedInUserId() || '';
    if (this.loggedInUserId) {
      this.loadFriendsData();
    }
  }

  private loadFriendsData(): void {
    if (this.loggedInUserId != null) {
      this.fetchFriends(this.loggedInUserId);
      this.fetchPendingFriends(this.loggedInUserId);
      this.fetchIngoingFriends(this.loggedInUserId);
    }
  }

  private fetchFriends(userId: string): void {
    this.friendsService.getUserFriends(userId).subscribe(
      (friends) => this.friends = friends,
      (error) => this.handleFetchError('user friends', error)
    );
  }

  private fetchPendingFriends(userId: string): void {
    this.friendsService.getPendingFriends(userId).subscribe(
      (friends) => this.pendingFriends = friends,
      (error) => this.handleFetchError('pending friends', error)
    );
  }

  private fetchIngoingFriends(userId: string): void {
    this.friendsService.getIngoingFriends(userId).subscribe(
      (friends) => this.ingoingFriends = friends,
      (error) => this.handleFetchError('ingoing friends', error)
    );
  }

  private handleFetchError(dataType: string, error: any): void {
    console.error(`Error fetching ${dataType}:`, error);
  }

  openLinkModal(): void {
    if (this.loggedInUserId != null) {
      const inviteLink = this.generateInviteLink(this.loggedInUserId);
      this.dialog.open(ShareFriendCodeDialogComponent, {
        data: { link: inviteLink, text: 'Your Friendcode:' },
        width: '500px',
      });
    }
  }

  private generateInviteLink(userId: string): string {
    return `https://www.memorise.online/invite/${userId}`;
  }
}
