import { Component, Input, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-link-modal',
  templateUrl: './link-modal.component.html',
  styleUrls: ['./link-modal.component.scss']
})
export class LinkModalComponent implements OnInit {

  link: string = ''; // Link to display in the modal
  header: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<LinkModalComponent>
  ) { }

  ngOnInit() {
    this.link = this.data.link;
    this.header = this.data.text;
  }

  copyLink() {
    navigator.clipboard.writeText(this.link)
      .then(() => {
        console.log('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  }

  closeModal() {
    this.dialogRef.close();
  }
}
