import { Component, Input, OnInit } from '@angular/core';
import { MemoriseUserActivity } from '../../models/activityInterface.model';

@Component({
  selector: 'app-activity-detail',
  standalone: false,
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.scss'
})

export class ActivityDetailComponent implements OnInit {
  @Input() activity: MemoriseUserActivity = {
    activityId: 43,
    title: 'Test Data',
    isPrivate: true,
    groupSizeMin: 1,
    groupSizeMax: 5,
    costs: 0,
    description: 'knhsortöhguoöjirshgöioarhgöarhjgnartkhaöertjhjiathjkajklthsrtjh',
    link: 'string',
    indoor: false,
    season: 'string',
    weather: 'string',
    location: {latitude: 0, longitude: 0, country: 'Austria', locality: 'Linz', location_id: 1},
    firebaseUrl: 'https://firebasestorage.googleapis.com/v0/b/memorise-910c3.appspot.com/o/activities%2F44%2Fthumbnail.jpg?alt=media&token=020fe672-b8ce-4c0e-97f6-973930002bbc',
  };
  mapOptions: google.maps.MapOptions = {};
  markerPosition!: google.maps.LatLngLiteral;
  
  allSeasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  seasons = ['Spring', 'Summer', 'Fall', ];
  allWeather = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Windy'];
  
  ngOnInit(): void {
    /*if (this.activity) {
      this.mapOptions = {
        center: { 
          lat: this.activity.location.lat, 
          lng: this.activity.location.lng 
        },
        zoom: 14
      };
      this.markerPosition = {
        lat: this.activity.location.lat,
        lng: this.activity.location.lng
      };
    }*/
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
