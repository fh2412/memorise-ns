import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogComponent, ConfirmationDialogData } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../services/userService';
import { FriendsService } from '../../services/friends.service';

@Component({
  selector: 'app-openlink',
  templateUrl: './openlink.component.html',
  styleUrl: './openlink.component.scss'
})
export class OpenlinkComponent implements OnInit {
  userId: any;
  user: any;
  loggedInUserId: any;

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private userService: UserService, private friedService: FriendsService) {
    
  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.userService.getUser(this.userId).subscribe(
      (response) => {
        this.user = response;
        this.showConfirmDialog();
      },
      (error) => {
        console.error('Error deleting memory and friends:', error);
        // Handle error, e.g., show an error message
      }
    );
  }

  showConfirmDialog() {
    const confirmationData: ConfirmationDialogData = {
      title: 'Offer Friendship',
      message: 'Do you want to add ' + this.user.name + ' as your friend?'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: confirmationData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.friedService.sendFriendRequest( this.loggedInUserId, this.userId).subscribe(
          response => {
            console.log('Friend request sent successfully', response);
          },
          error => {
            console.error('Error sending friend request', error);
          }
        );
      }
    });
  }
}



//TODO
//Redirect to home if the userID does not exist
//Check why the dialog has to be close twice