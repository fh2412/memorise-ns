import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime, switchMap, startWith } from "rxjs/operators";
import { of } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-memory-add-friend-dialog',
  templateUrl: './memory-add-friend-dialog.component.html',
  styleUrl: './memory-add-friend-dialog.component.css'
})
export class MemoryAddFriendDialogComponent {
  constructor(public dialogRef: MatDialogRef<MemoryAddFriendDialogComponent>) {}

  search = new FormControl();
  friendsControl = new FormControl();
  listOfFriends: string[] = [
    "Maxl",
    "Kralli",
    "Niki",
    "Lele",
    "Jona"
  ];
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
    console.log(option);
    let value = this.friendsControl.value || [];
    if (option.selected) value.push(option.value);
    else value = value.filter((x: any) => x != option.value);
    this.friendsControl.setValue(value);
  }
  ngOnInit() {}

  closeDialog() {
    this.dialogRef.close();
  }
  saveDialog() {
    this.dialogRef.close();
  }
}
