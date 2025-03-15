import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityTag } from '../../components/activity-card/activity-card.component';

@Component({
  selector: 'app-my-activity-overview',
  standalone: false,
  templateUrl: './my-activity-overview.component.html',
  styleUrl: './my-activity-overview.component.scss'
})
export class MyActivityOverviewComponent implements OnInit {
  userId!: string;
  userName = '';

  hikingTags: ActivityTag[] = [
    { name: 'Adventure', color: '#4CAF50' },
    { name: 'Nature', color: '#2196F3' },
    { name: 'Moderate', color: '#FF9800' }
  ];

  climbingTags: ActivityTag[] = [
    { name: 'Sport', color: '#9C27B0' },
    { name: 'Beginner', color: '#4CAF50' },
    { name: 'Indoor', color: '#607D8B' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('user_id') || '';
    this.userName = history.state.userName || 'Unknown';
  }
}
