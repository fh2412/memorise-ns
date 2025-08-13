import { CommonModule } from '@angular/common';
import { Component, inject, Inject, Input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
 import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetModule} from '@angular/material/bottom-sheet'; 
import { Friend } from '../../models/userInterface.model';
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

  private bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this.bottomSheet.open(FriendRequestsBottomSheetComponent, {
      data: { friends: this.friends }
    });
  }
}

// Bottom Sheet Component
@Component({
  selector: 'app-friend-requests-bottom-sheet',
  standalone: true,
  imports: [
    CommonModule,
    MatBottomSheetModule
    // FriendCardComponent // Uncomment when you import your component
  ],
  template: `
    <div class="bottom-sheet-content">
      <!-- Uncomment this when you have your friend-card component available -->
      <!--
      <app-friend-card 
        [friends]="data.friends" 
        [title]="'Ingoing Requests'" 
        [buttonText]="'Accept'"
        [requestedText]="'Accepted'" 
        [buttonColor]="'primary'" 
        [buttonIcon]="'person_add'">
      </app-friend-card>
      -->
      
      <!-- Temporary placeholder - remove when you uncomment above -->
      <div class="placeholder">
        <h2>Ingoing Requests</h2>
        <p>{{ data.friends.length }} friend requests pending</p>
        <p><em>Your friend-card component will be displayed here</em></p>
      </div>
    </div>
  `,
  styles: [`
    .bottom-sheet-content {
      padding: 16px;
      min-height: 200px;
    }
    
    .placeholder {
      text-align: center;
      padding: 20px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .placeholder h2 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.87);
    }
  `]
})
export class FriendRequestsBottomSheetComponent {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { friends: Friend[] }) {}
}
