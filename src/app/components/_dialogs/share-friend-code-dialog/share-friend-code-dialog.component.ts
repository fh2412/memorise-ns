import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-link-modal',
  templateUrl: './share-friend-code-dialog.component.html',
  styleUrls: ['./share-friend-code-dialog.component.scss']
})
export class ShareFriendCodeDialogComponent implements OnInit {

  link = '';
  header = '';

  constructor(private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: { link: string, text: string },
    private dialogRef: MatDialogRef<ShareFriendCodeDialogComponent>
  ) { }

  ngOnInit() {
    this.link = this.data.link;
    this.header = this.data.text;
  }

  copyLink() {
    navigator.clipboard.writeText(this.link)
      .then(() => {
        this.openSnackBar('Link copied to clipboard!', 'Great!');
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        this.openSnackBar('Failed to copy link:', 'Understood!');
      });
  }

  closeModal() {
    this.dialogRef.close();
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
}
