import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent implements OnInit{
  friends: any[] = []; // Replace any with the actual type of your friends

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    // Fetch or set the list of friends
    // Example:
    this.friends = [
      { name: 'Friend 1', dob: '1990-01-01', gender: 'Male' },
      { name: 'Friend 2', dob: '1995-05-05', gender: 'Female' },
      { name: 'Friend 3', dob: '1995-05-05', gender: 'Female' },
      { name: 'Friend 4', dob: '1995-05-05', gender: 'Male' },
      { name: 'Friend 5', dob: '1995-05-05', gender: 'Male' },
      { name: 'Friend 6', dob: '1995-05-05', gender: 'Female' },
    ];
  }

  openSeeAllDialog(): void {
    //const dialogRef = this.dialog.open(SeeAllDialogComponent, {
    //  data: { friends: this.friends } // Pass the complete list of friends to the dialog
    //});
    console.log("Open Dialog!");
  }
}
