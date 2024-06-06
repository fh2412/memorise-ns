import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmationDialogData } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../services/userService';
import { FriendsService } from '../../services/friends.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-openlink',
  templateUrl: './openlink.component.html',
  styleUrl: './openlink.component.scss'
})
export class OpenlinkComponent implements OnInit {
  userId: any;
  user: any;
  loggedInUserId: any;

  constructor(private route: ActivatedRoute, private router: Router, public dialog: MatDialog, private userService: UserService, private friedService: FriendsService, private _snackBar: MatSnackBar) {
    
  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.loggedInUserId = this.userService.getLoggedInUserId();

    this.userService.getUser(this.userId).subscribe(
      (response) => {
        this.user = response;
        if (this.router.url.startsWith('/invite')) {
          this.checkFriendshipStatus();
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
        // Handle error, e.g., show an error message
      }
    );
  }

  showConfirmDialog(title: string, message: string) {
    const confirmationData: ConfirmationDialogData = {
      title: title,
      message: message
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: confirmationData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && title == "Offer Friendship") {
        this.friedService.sendFriendRequest( this.loggedInUserId, this.userId).subscribe(
          response => {
            console.log('Friend request sent successfully', response);
          },
          error => {
            console.error('Error sending friend request', error);
          }
        );
      }
      else if (result && title == "Accept Friend Request") {
        this.friedService.acceptFriendRequest( this.loggedInUserId, this.userId).subscribe(
          response => {
            console.log('Friend added', response);
          },
          error => {
            console.error('Error sending friend request', error);
          }
        );
      }
    });
  }

  checkFriendshipStatus(){
    this.friedService.getFriendsStatus(this.loggedInUserId, this.userId).subscribe(
      (response) => {
        const result = response.toString();
        console.log(response);
        if(result == 'empty'){
          this.showConfirmDialog('Offer Friendship', 'Do you want to add ' + this.user.name + ' as your friend?');
        }
        else if(result == 'waiting'){
          this.showConfirmDialog('Accept Friend Request', 'Do you want to accept ' + this.user.name + ' as your friend?');
        }
        else if(result == 'accepted'){
          this.openSnackBar('You guys are already friends!', 'Great!');
        }
        else if(result == 'pending'){
          this.openSnackBar('You already send this user a friend request!', 'Got it!');
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

}