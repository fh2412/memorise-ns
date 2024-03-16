import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MemoryService } from '../../../services/memory.service';

@Component({
  selector: 'app-manage-friends-dialog',
  templateUrl: './manage-friends-dialog.component.html',
  styleUrls: ['./manage-friends-dialog.component.css']
})
export class ManageFriendsDialogComponent {
  constructor(private dialogRef: MatDialogRef<ManageFriendsDialogComponent>, private friendsService: MemoryService, @Inject(MAT_DIALOG_DATA) public data: { memoryId: string }) { }


  //@Input() memoryId: string = '';
  @Input() userId: string = '4';
  friends: any[] = [];

  async ngOnInit(): Promise<void> {
    this.friendsService.getMemorysFriends(this.data.memoryId, this.userId).subscribe(
      (response) => {
        this.friends = response;
        console.log(this.friends);
      },
      (error) => {
        console.error('Error deleting memory and friends:', error);
        // Handle error, e.g., show an error message
      }
    );
  }

  onSave(): void {
    // You can add save logic here
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
