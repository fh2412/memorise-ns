import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Inject, Input, Output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { Friend } from '../../models/userInterface.model';
import { FriendCardComponent } from "../friend-card/friend-card.component";
@Component({
  selector: 'app-ingoing-requests',
  imports: [CommonModule,
    MatCardModule,
    MatIconModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatRippleModule],
  templateUrl: './ingoing-requests.component.html',
  styleUrl: './ingoing-requests.component.scss'
})
export class IngoingRequestsComponent {
  @Input() friends: Friend[] = [];
  @Output() friendsUpdated = new EventEmitter<Friend[]>();

  private bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this.bottomSheet.open(FriendRequestsBottomSheetComponent, {
      data: { friends: this.friends },
    });
  }
}

// Bottom Sheet Component
@Component({
  selector: 'app-friend-requests-bottom-sheet',
  standalone: true,
  imports: [
    CommonModule,
    MatBottomSheetModule,
    FriendCardComponent
  ],
  template: `
    <div class="bottom-sheet-content">
      <app-friend-card 
        [friends]="data.friends" 
        [title]="'Ingoing Requests'" 
        [buttonText]="'Accept'"
        [requestedText]="'Accepted'" 
        [buttonColor]="'primary'" 
        [buttonIcon]="'person_add'">
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
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { friends: Friend[] }) { }
}
