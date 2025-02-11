import { Component, Input } from '@angular/core';
import { Friend } from '../../models/userInterface.model';

@Component({
    selector: 'app-friend-card',
    templateUrl: './friend-card.component.html',
    styleUrls: ['./friend-card.component.scss'] // Fixed typo in styleUrls
    ,
    standalone: false
})
export class FriendCardComponent {
  /** Title displayed on the card */
  @Input() title = '';

  /** Array of friend objects to display */
  @Input() friends: Friend[] = [];

  /** Whether the friend request has been sent */
  @Input() requested = false;

  /** Text displayed on the button (e.g., "Request" or "Add Friend") */
  @Input() buttonText = 'Request';

  /** Text displayed if the request is already sent */
  @Input() requestedText = 'Requested';

  /** Color for the button (can be 'primary', 'accent', 'warn', etc.) */
  @Input() buttonColor = 'primary';

  /** Icon for the button, like 'person_add' for adding a friend */
  @Input() buttonIcon = 'person_add';
}
