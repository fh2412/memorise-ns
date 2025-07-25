import { Component, OnInit } from '@angular/core';
import { ActivityCreator, ActivityDetails } from '../../models/activityInterface.model';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '../../services/activity.service';
import { UserService } from '../../services/userService';

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
  creatorDetails!: ActivityCreator;
  isCreator = false;

  allSeasons = [
    {season_id: 1, name: 'Spring', icon: 'grass'},
    {season_id: 2, name: 'Summer', icon: 'wb_sunny'},
    {season_id: 3, name: 'Fall', icon: 'park'},
    {season_id: 4, name: 'Winter', icon: 'ac_unit'},
  ];
  allWeather = [
    {weather_id: 1, name: 'Sunny', icon: 'wb_sunny'},
    {weather_id: 3, name: 'Cloudy', icon: 'cloud'},
    {weather_id: 4, name: 'Rainy', icon: 'water_drop'},
    {weather_id: 7, name: 'Snowy', icon: 'air'},
    {weather_id: 6, name: 'Windy', icon: 'ac_unit'}
  ];

  isLoading = true;
  errorMessage = '';
  
  constructor(private route: ActivatedRoute, private activitiesService: ActivityService, private router: Router, private userService: UserService) {}

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
        this.markerPosition = {lat: Number(data.location.latitude), lng: Number(data.location.longitude)}
        this.mapOptions.center = this.markerPosition;
        this.mapOptions.zoom = 10;
        if(this.activity){
          this.activitiesService.getActivityCreator(this.activity.id ,this.activity.creatorId).subscribe({
            next: (data) => {
              this.isCreator = this.checkIfUserIsCreator(this.activity.creatorId);
              this.isLoading = false;
              this.creatorDetails = data;
            },
            error: (error) => {
              console.error('Error fetching activity creator details', error);
              this.errorMessage = 'Failed to load activity creator details. Please try again.';
              this.isLoading = false;
            }
          });
        }
        else{
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching activity details', error);
        this.errorMessage = 'Failed to load activity details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  checkIfUserIsCreator(creatorId: string): boolean {
    const loggedInUserId = this.userService.getLoggedInUserId();
    if(creatorId === loggedInUserId){
      return true;
    } 
    return false;
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

  navigateLeadMemory(){
    this.router.navigate(['memory/', this.activity.baseMemoryId]);
  }

  navigateEditActivity(){
    this.router.navigate(['activity/edit/', this.activity.id]);
  }

  navigateCreateMemory(){
    this.router.navigate(['/newmemory'], { state: { activityId: this.activity.id } });
  }

  isSeasonSelected(seasonId: number): boolean {
    return this.activity.seasons.some(s => s.season_id === seasonId);
  }

  isWeatherSelected(weatherId: number): boolean {
    return this.activity.weatherConditions.some(w => w.weather_id === weatherId);
  }
}
