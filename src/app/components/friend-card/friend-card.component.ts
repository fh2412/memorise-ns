import { Component, Input, input, output } from '@angular/core';
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
  readonly title = input('');
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() friends: Friend[] = [];
  readonly requested = input(false);
  readonly buttonText = input('Request');
  readonly requestedText = input('Requested');
  readonly declineButton = input(false);
  readonly buttonIcon = input('person_add');

  readonly friendsChanged = output<Friend[]>();

  onFriendRequestProcessed(event: { friendId: string, action: 'accepted' | 'declined' }): void {
    this.friends = this.friends.filter(friend => friend.user_id.toString() !== event.friendId);

    this.friendsChanged.emit(this.friends);
  }
}
