import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FriendsService } from '../../services/friends.service';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})

export class FriendsComponent implements OnInit{
  friends: any[] = []; // Replace any with the actual type of your friends
  friendSuggestions: any[] = [];
  pendingFriends: any[] = [];
  ingoingFriends: any[] = [];
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

    // Fetch friend suggestions
    this.friendsService.getFriendSuggestions(this.loggedInUserId).subscribe(
      (suggestions) => {
        this.friendSuggestions = suggestions;
      },
      (error) => {
        console.error('Error fetching friend suggestions:', error);
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


  openSeeAllDialog(): void {
    //const dialogRef = this.dialog.open(SeeAllDialogComponent, {
    //  data: { friends: this.friends } // Pass the complete list of friends to the dialog
    //});
    console.log("Open Dialog!");
  }
}