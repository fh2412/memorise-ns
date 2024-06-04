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

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private userServie: UserService, private friedService: FriendsService) {
    
  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.userServie.getUser(this.userId).subscribe(
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
        // Logic to add friend
        console.log("Send Friend Request")
      }
    });
  }
}
