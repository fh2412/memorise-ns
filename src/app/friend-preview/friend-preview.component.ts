import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-friend-preview',
  templateUrl: './friend-preview.component.html',
  styleUrl: './friend-preview.component.scss'
})
export class FriendPreviewComponent {
  @Input() requested: boolean = false;
  @Input() buttonText: string = 'Request';
  @Input() requestedText: string = 'Requested';
  @Input() buttonColor: string = 'primary'; // Use MatButton color options (primary, accent, warn, etc.)
  @Input() buttonIcon: string = 'person_add'; // Use MatButton icon options

  requestFriend() {
    this.requested = !this.requested;
    console.log(this.requested);
  }
}
