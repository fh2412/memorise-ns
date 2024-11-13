import { Component } from '@angular/core';
import { MemoriseUser } from '../../models/userInterface.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/userService';
import { FriendsService } from '../../services/friends.service';
import { ConfirmationDialogData, ConfirmDialogComponent } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ManageFriendsService } from '../../services/friend-manage.service';
import { pinnedMemoryService } from '../../services/pinnedMemorService';
import { Memory } from '../../models/memoryInterface.model';

@Component({
  selector: 'app-other-userprofile',
  templateUrl: './other-userprofile.component.html',
  styleUrl: './other-userprofile.component.scss'
})
export class OtherUserprofileComponent {
  user!: MemoriseUser;
  userId!: string;
  loggedInUserId: string | null = null;
  buttonText: string = 'Send Request';
  pin_memories: Memory[] = [];


  constructor(private route: ActivatedRoute, private pinnedService: pinnedMemoryService, private userService: UserService, private friendService: FriendsService, public dialog: MatDialog, private router: Router, private _snackBar: MatSnackBar, private manageFriendService: ManageFriendsService) {

  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId') as string;
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.getPinnedMemories();

    try {
      this.user = await this.userService.getUser(this.userId).toPromise();
      this.checkFriendshipStatus();
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  getPinnedMemories() {
    this.pinnedService.getPinnedMemories(this.userId).subscribe(
      memories => {
        this.pin_memories = memories;
      },
      error => {
        console.error('Error fetching pinned memories:', error);
      }
    );
  }

  getMemoriesToDisplay(): Memory[] {
    return this.pinnedService.getPinnedMemoriesWithPlacholders(this.pin_memories);
  }

  checkFriendshipStatus() {
    if (this.loggedInUserId == this.userId) {
      this.router.navigate(['/userprofile/', this.userId]);
    }
    else if (this.loggedInUserId) {
      this.friendService.getFriendsStatus(this.loggedInUserId, this.userId).subscribe(
        response => {
          const result = response.toString();
          switch (result) {
            case 'empty':
              this.buttonText = 'Offer Friendship';
              if (this.router.url.startsWith('/invite')) {
                this.showConfirmDialog('Offer Friendship', `Do you want to add ${this.user.name} as your friend?`);
              }
              break;
            case 'waiting':
              this.buttonText = 'Accept Friend';
              if (this.router.url.startsWith('/invite')) {
                this.showConfirmDialog('Accept Friend Request', `Do you want to accept ${this.user.name} as your friend?`);
              }
              break;
            case 'accepted':
              this.buttonText = 'Remove Friend';
              if (this.router.url.startsWith('/invite')) {
                this.openSnackBar('You guys are already friends!', 'Great!');
              }
              break;
            case 'pending':
              this.buttonText = 'Cancel Request';
              if (this.router.url.startsWith('/invite')) {
                this.openSnackBar('You already sent this user a friend request!', 'Got it!');
              }
              break;
          }
        },
        error => {
          console.error('Error fetching friendship status:', error);
        }
      );
    }
  }

  showConfirmDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title, message } as ConfirmationDialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.loggedInUserId) {
        if (title === 'Offer Friendship') {
          this.sendFriendRequest();
        } else if (title === 'Accept Friend Request') {
          this.acceptFriendRequest();
        }
      }
    });
  }

  sendFriendRequest() {
    this.friendService.sendFriendRequest(this.loggedInUserId!, this.userId).subscribe(
      response => console.log('Friend request sent successfully', response),
      error => console.error('Error sending friend request', error)
    );
  }

  acceptFriendRequest() {
    this.friendService.acceptFriendRequest(this.loggedInUserId!, this.userId).subscribe(
      response => console.log('Friend added', response),
      error => console.error('Error accepting friend request', error)
    );
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  friendButtonClick(): void {
    if (this.loggedInUserId) {
      switch (this.buttonText) {
        case 'Offer Friendship':
          this.sendFriendRequest();
          this.openSnackBar('Friend Request sent successfully!', 'Great!');
          this.buttonText = 'Cancel Request';
          break;
        case 'Accept Friend':
          this.acceptFriendRequest();
          this.openSnackBar('You successfully added this user as a friend!', 'We go memorizing!');
          this.buttonText = 'Remove Friend';
          break;
        case 'Remove Friend':
        case 'Cancel Request':
          this.manageFriendService.removeFriend(this.userId, this.loggedInUserId);
          this.openSnackBar('You ended this Friendship', 'Got it!');
          this.buttonText = 'Offer Friendship';
          break;
      }
    }
  }
}
