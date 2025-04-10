import { Component, OnInit } from '@angular/core';
import { ActivityDetails } from '../../models/activityInterface.model';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-activity-detail',
  standalone: false,
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.scss'
})

export class ActivityDetailComponent implements OnInit {
  activity!: ActivityDetails;
  mapOptions: google.maps.MapOptions = {};
  markerPosition!: google.maps.LatLngLiteral;
  
  allSeasons = [
    {id: 0, name: 'Spring'},
    {id: 0, name: 'Summer'},
    {id: 0, name: 'Fall'},
    {id: 0, name: 'Winter'},
  ];
  allWeather = [
    {id: 0, name: 'Sunny', description: 'The sun is shining fully'},
    {id: 1, name: 'Cloudy', description: 'The sun is shining fully'},
    {id: 2, name: 'Rainy', description: 'The sun is shining fully'},
    {id: 3, name: 'Snowy', description: 'The sun is shining fully'},
    {id: 4, name: 'Windy', description: 'The sun is shining fully'}
  ];

  isLoading = true;
  errorMessage = '';
  
  constructor(private route: ActivatedRoute,private activitiesService: ActivityService) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const activityId = params.get('id');
        if (!activityId) {
          throw new Error('Activity ID is required');
        }
        return this.activitiesService.getActivityDetails(activityId);
      })
    ).subscribe({
      next: (data) => {
        this.activity = data;
        this.isLoading = false;
        console.log(this.activity);
      },
      error: (error) => {
        console.error('Error fetching activity details', error);
        this.errorMessage = 'Failed to load activity details. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  getGroupSizeText(): string {
    const min = this.activity.groupSizeMin
    const max = this.activity.groupSizeMax;
    if (min === max) {
      return `${min} ${min === 1 ? 'person' : 'people'}`;
    }
    return `${min}-${max} people`;
  }
  
  getPriceText(): string {
    const value = this.activity.costs;
    if (value === 0) {
      return 'Free';
    }
    return `€${value}`;
  }
  
  getFileIcon(fileType: string): string {
    switch (fileType.toLowerCase()) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'xls':
      case 'xlsx': return 'table_chart';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      case 'mp4':
      case 'mov': return 'videocam';
      default: return 'insert_drive_file';
    }
  }
}
