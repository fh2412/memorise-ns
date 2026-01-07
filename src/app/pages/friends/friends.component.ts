import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FriendsService } from '@services/friends.service';
import { UserService } from '@services/userService';
import { ShareFriendCodeDialogComponent } from '@components/_dialogs/share-friend-code-dialog/share-friend-code-dialog.component';
import { Friend } from '@models/userInterface.model';
import { Router } from '@angular/router';
import { UserInformationComponent } from '../../components/user-information/user-information.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { IngoingRequestsComponent } from '../../components/ingoing-requests/ingoing-requests.component';
import { FriendCardComponent } from '../../components/friend-card/friend-card.component';
import { FriendSearchComponent } from '../../components/friend-search/friend-search.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss',
  imports: [UserInformationComponent, MatButton, MatIcon, IngoingRequestsComponent, FriendCardComponent, FriendSearchComponent]
})
export class FriendsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private readonly friendsService = inject(FriendsService);
  private readonly userService = inject(UserService);
  private router = inject(Router);


  friends: Friend[] = [];
  ingoingFriends: Friend[] = [];
  loggedInUserId: string | null = null;

  async ngOnInit(): Promise<void> {
    this.loggedInUserId = this.userService.getLoggedInUserId() || '';
    if (this.loggedInUserId) {
      await this.loadFriendsData(this.loggedInUserId);
    }
  }

  private async loadFriendsData(userId: string): Promise<void> {
    await Promise.all([
      this.fetchFriends(userId),
      this.fetchIngoingFriends(userId)
    ]);
  }

  private async fetchFriends(userId: string): Promise<void> {
    try {
      this.friends = await firstValueFrom(this.friendsService.getUserFriends(userId));
    } catch (error) {
      console.error(`error fetching friends:`, error);
    }
  }

  private async fetchIngoingFriends(userId: string): Promise<void> {
    try {
      this.ingoingFriends = await firstValueFrom(this.friendsService.getIngoingFriends(userId));
    } catch (error) {
      console.error(`error fetching ingoing friends`, error);
    }
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
    return `https://memorise.online/invite/${userId}`;
  }

  viewProfile() {
    if (this.loggedInUserId) {
      this.router.navigate([`/userprofile/${this.loggedInUserId}`]);
    }
  }

  onIngoingFriendsUpdated(updatedFriends: Friend[]): void {
    this.ingoingFriends = updatedFriends;
  }
}
