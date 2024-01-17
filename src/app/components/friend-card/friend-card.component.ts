import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrl: './friend-card.component.scss'
})
export class FriendCardComponent {
  @Input() title: string = '';
  @Input() friends: any;
  @Input() requested: boolean = false;
  @Input() buttonText: string = 'Request';
  @Input() requestedText: string = 'Requested';
  @Input() buttonColor: string = 'primary'; // Use MatButton color options (primary, accent, warn, etc.)
  @Input() buttonIcon: string = 'person_add'; // Use MatButton icon options

  openSeeAllDialog() {
    console.log("Open Dialog");
  }
}
