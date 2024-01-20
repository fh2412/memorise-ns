import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime, switchMap, startWith } from "rxjs/operators";
import { of } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { FriendsService } from "../../../services/friends.service";
import { UserService } from "../../../services/userService";

@Component({
  selector: 'app-memory-add-friend-dialog',
  templateUrl: './memory-add-friend-dialog.component.html',
  styleUrl: './memory-add-friend-dialog.component.css'
})
export class MemoryAddFriendDialogComponent implements OnInit{
  constructor(public dialogRef: MatDialogRef<MemoryAddFriendDialogComponent>, private friendsService: FriendsService, private userService: UserService) {}

  listOfFriends: any[] = []; // Replace any with the actual type of your friends
  loggedInUserId: string | any;

  ngOnInit(): void {
    this.getFriends();
  }

  private async getFriends(){
    // Fetch or set the list of friends
    this.loggedInUserId = this.userService.getLoggedInUserId();
    // Fetch user friends
    this.friendsService.getUserFriends(this.loggedInUserId).subscribe(
      (friends) => {
        this.listOfFriends = friends.map(item => [item.user_id, item.name]);;
      },
      (error) => {
        console.error('Error fetching user friends:', error);
      }
    );
  }
  search = new FormControl();
  friendsControl = new FormControl();
  $search = this.search.valueChanges.pipe(
    startWith(null),
    debounceTime(200),
    switchMap((res: string) => {
      if (!res) return of(this.listOfFriends);
      res = res.toLowerCase();
      return of(
        this.listOfFriends.filter(x => x.toLowerCase().indexOf(res) >= 0)
      );
    })
  );
  selectionChange(option: any) {
    let value = this.friendsControl.value || [];
    if (option.selected) value.push(option.value);
    else value = value.filter((x: any) => x != option.value);
    this.friendsControl.setValue(value);
  }
  removeFriend(friend: any) {
    let value = this.friendsControl.value || [];
    value = value.filter((x: any) => x != friend);
    this.friendsControl.setValue(value);
  }
  closeDialog() {
    this.dialogRef.close();
  }
  saveDialog() {
    console.log(this.friendsControl.value)
    this.dialogRef.close();
  }
}
