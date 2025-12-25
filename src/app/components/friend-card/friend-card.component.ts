import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Friend } from '@models/userInterface.model';
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { FriendPreviewComponent } from "../friend-preview/friend-preview.component";

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.scss'],
  imports: [MatCardModule, MatListModule, FriendPreviewComponent]
})
export class FriendCardComponent {
  @Input() title = '';
  @Input() friends: Friend[] = [];
  @Input() requested = false;
  @Input() buttonText = 'Request';
  @Input() requestedText = 'Requested';
  @Input() declineButton = false;
  @Input() buttonIcon = 'person_add';

  @Output() friendsChanged = new EventEmitter<Friend[]>();

  onFriendRequestProcessed(event: { friendId: string, action: 'accepted' | 'declined' }): void {
    this.friends = this.friends.filter(friend => friend.user_id.toString() !== event.friendId);

    this.friendsChanged.emit(this.friends);
  }
}
