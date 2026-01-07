import { Component, inject, input, output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Friend } from '@models/userInterface.model';
import { FriendCardComponent } from "../friend-card/friend-card.component";

@Component({
  selector: 'app-ingoing-requests',
  imports: [MatCardModule, MatIconModule, MatBadgeModule, MatBottomSheetModule, MatRippleModule],
  templateUrl: './ingoing-requests.component.html',
  styleUrl: './ingoing-requests.component.scss'
})
export class IngoingRequestsComponent {
  readonly ingoingFriends = input<Friend[]>([]);
  readonly friendsUpdated = output<Friend[]>();
  
  private bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    const bottomSheetRef = this.bottomSheet.open(FriendRequestsBottomSheetComponent, {
      data: { 
        friends: this.ingoingFriends(),
        onFriendsChanged: (updatedFriends: Friend[]) => {
          this.friendsUpdated.emit(updatedFriends);
        }
      },
    });

    // Handle any final updates when sheet closes
    bottomSheetRef.afterDismissed().subscribe((updatedFriends?: Friend[]) => {
      if (updatedFriends !== undefined) {
        this.friendsUpdated.emit(updatedFriends);
      }
    });
  }
}

@Component({
  selector: 'app-friend-requests-bottom-sheet',
  standalone: true,
  imports: [
    MatBottomSheetModule,
    FriendCardComponent
  ],
  template: `
    <div class="bottom-sheet-content">
      <app-friend-card
        [friends]="currentFriends"
        [title]="'Ingoing Requests'"
        [buttonText]="'Accept'"
        [requestedText]="'Accepted'"
        [buttonIcon]="'person_add'"
        [declineButton]="true"
        (friendsChanged)="onFriendsChanged($event)">
      </app-friend-card>
    </div>
  `,
  styles: [`
    .bottom-sheet-content {
      padding: 16px;
      min-height: 300px;
      min-width: 600px;
    }
  `]
})
export class FriendRequestsBottomSheetComponent {
  data = inject<{
    friends: Friend[];
    onFriendsChanged: (friends: Friend[]) => void;
  }>(MAT_BOTTOM_SHEET_DATA);
  
  private bottomSheetRef = inject<MatBottomSheetRef<FriendRequestsBottomSheetComponent>>(MatBottomSheetRef);
  
  currentFriends: Friend[] = [];

  constructor() {
    this.currentFriends = [...this.data.friends];
  }

  onFriendsChanged(updatedFriends: Friend[]): void {
    this.currentFriends = updatedFriends;
    
    this.data.onFriendsChanged(updatedFriends);
    
    // Close bottom sheet if no friends left
    if (updatedFriends.length === 0) {
      this.bottomSheetRef.dismiss(updatedFriends);
    }
  }
}