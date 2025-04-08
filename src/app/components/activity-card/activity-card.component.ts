// activity-card.component.ts
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { Router } from '@angular/router';

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
  @Input() activity!: MemoriseUserActivity;

  constructor(private router: Router) {}

  viewDetails() {
    this.router.navigate(['activity/details/', this.activity.activityId]);
  }
}
