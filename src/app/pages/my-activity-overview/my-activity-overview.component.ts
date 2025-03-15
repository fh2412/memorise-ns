import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-activity-overview',
  standalone: false,
  templateUrl: './my-activity-overview.component.html',
  styleUrl: './my-activity-overview.component.scss'
})
export class MyActivityOverviewComponent implements OnInit {
  userId!: string; // Holds the extracted user ID

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('userId') || '';
    });
  }
}
