import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-friend-preview',
  templateUrl: './friend-preview.component.html',
  styleUrl: './friend-preview.component.scss'
})
export class FriendPreviewComponent {
  @Input() requested: boolean = false;

  requestFriend() {
    this.requested = !this.requested;
    console.log(this.requested);
  }
}
