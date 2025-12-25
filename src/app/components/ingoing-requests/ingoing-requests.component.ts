
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
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
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() friends: Friend[] = [];
  @Output() friendsUpdated = new EventEmitter<Friend[]>();
  
  private bottomSheet = inject(MatBottomSheet);
  private currentBottomSheetRef: MatBottomSheetRef<FriendRequestsBottomSheetComponent> | null = null;

  openBottomSheet(): void {
    this.currentBottomSheetRef = this.bottomSheet.open(FriendRequestsBottomSheetComponent, {
      data: { friends: this.friends },
    });

    this.currentBottomSheetRef.afterDismissed().subscribe((updatedFriends?: Friend[]) => {
      
      if (updatedFriends !== undefined) {
        this.friends = updatedFriends;
        
        this.friendsUpdated.emit(this.friends);
      } else {
        if (this.currentBottomSheetRef?.instance) {
          const currentFriends = this.currentBottomSheetRef.instance.currentFriends;
          if (currentFriends.length !== this.friends.length) {
            this.friends = currentFriends;
            this.friendsUpdated.emit(this.friends);
          }
        }
      }
      
      this.currentBottomSheetRef = null;
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
}>(MAT_BOTTOM_SHEET_DATA);
  private bottomSheetRef = inject<MatBottomSheetRef<FriendRequestsBottomSheetComponent>>(MatBottomSheetRef);

  currentFriends: Friend[] = [];

  constructor() {
    const data = this.data;

    this.currentFriends = [...data.friends];
  }

  onFriendsChanged(updatedFriends: Friend[]): void {
    this.currentFriends = updatedFriends;
    
    if (updatedFriends.length === 0) {
      this.bottomSheetRef.dismiss(updatedFriends);
    }
  }
}
