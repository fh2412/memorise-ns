import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendPreviewComponent } from './friend-preview.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [FriendPreviewComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
],
  exports: [FriendPreviewComponent]
})
export class FriendsPreviewModule {}
