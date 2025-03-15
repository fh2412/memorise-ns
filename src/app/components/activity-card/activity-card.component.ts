// activity-card.component.ts
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

export interface ActivityTag {
  name: string;
  color?: string;
}

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrl: './activity-card.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatChipsModule
  ],
})
export class ActivityCardComponent {
  @Input() title = '';
  @Input() backgroundImage = '';
  @Input() groupSizeMin = 1;
  @Input() groupSizeMax = 10;
  @Input() isOutdoor = true;
  @Input() locationTooltip = 'Outdoor activity';
  @Input() price: number | null = null;
  @Input() rating = 0;
  @Input() timesPerformed = 0;
  @Input() tags: ActivityTag[] = [];
  @Input() activityId: string | number = '';

  viewDetails() {
    console.log(`Viewing details for activity: ${this.activityId}`);
  }
}
