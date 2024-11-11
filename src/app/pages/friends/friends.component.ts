import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FriendsService } from '../../services/friends.service';
import { UserService } from '../../services/userService';
import { LinkModalComponent } from '../../components/_dialogs/link-modal/link-modal.component';
import { Friend } from '../../models/userInterface.model';


@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})

export class FriendsComponent implements OnInit{
  friends: Friend[] = [];
  pendingFriends: Friend[] = [];
  ingoingFriends: Friend[] = [];
  loggedInUserId: string | any;

  constructor(private dialog: MatDialog, private friendsService: FriendsService, private userService: UserService) {}

  ngOnInit(): void {
    this.getUserData();
  }

  private async getUserData(){
    // Fetch or set the list of friends
    this.loggedInUserId = this.userService.getLoggedInUserId();
    // Fetch user friends
    this.friendsService.getUserFriends(this.loggedInUserId).subscribe(
      (friends) => {
        this.friends = friends;
      },
      (error) => {
        console.error('Error fetching user friends:', error);
      }
    );

    this.friendsService.getPendingFriends(this.loggedInUserId).subscribe(
      (friends) => {
        this.pendingFriends = friends;
      },
      (error) => {
        console.error('Error fetching user friends:', error);
      }
    );

    this.friendsService.getIngoingFriends(this.loggedInUserId).subscribe(
      (friends) => {
        this.ingoingFriends = friends;
      },
      (error) => {
        console.error('Error fetching user friends:', error);
      }
    );
  }

  openLinkModal() {
    const dialogRef = this.dialog.open(LinkModalComponent, {
      data: { link: 'https://www.memorise.online/invite/' + this.loggedInUserId, text: 'Your Friendcode:' },
      width: '500px',
    });
  
    dialogRef.afterClosed().subscribe(result => {});
      
  }
}