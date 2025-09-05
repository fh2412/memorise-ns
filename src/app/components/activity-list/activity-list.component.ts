import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivityCardComponent } from "../activity-card/activity-card.component";
import { Router } from '@angular/router';
import { ActivityService } from '../../services/activity.service';
import { BookmarkService } from '../../services/bookmarking.service';
import { NotFoundComponent } from "../not-found/not-found.component";
import { GeocodingService } from '../../services/geocoding.service';
import { GeocoderResponse } from '../../models/geocoder-response.model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FilterBottomSheetComponent } from '../_dialogs/filter-bottom-sheet/filter-bottom-sheet.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ActivityCardComponent,
    NotFoundComponent,
  ],
})
export class ActivityListComponent implements OnInit {
  @Input() activities: MemoriseUserActivity[] = [];

  filteredActivities: WritableSignal<MemoriseUserActivity[]> = signal([]);
  bookmarkedActivities = this.bookmarkedService.bookmarkedActivities;
  paginatedActivities: MemoriseUserActivity[] = [];
  paginatorLength = 0;
  viewMode: 'grid' | 'list' | 'bookmark' = 'grid';
  pageSize = 12;
  currentPage = 0;
  filterForm: FormGroup;
  searchControl = new FormControl('');
  fulladdress: GeocoderResponse | null = null;
  isLoading = false;

  private _bottomSheet = inject(MatBottomSheet);

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private activityService: ActivityService, 
    private bookmarkedService: BookmarkService, 
    private geocodingService: GeocodingService
  ) {
    this.filterForm = this.fb.group({
      location: [''],
      distance: [25],
      season: [''],
      weather: [''],
      activityType: [[]],
      groupSize: [1],
      price: [100],
      name: [''],
      freeActivities: [false],
      familyFriendly: [false],
      petFriendly: [false],
      accessibleActivities: [false]
    });
  }

  ngOnInit(): void {
    this.filteredActivities.set([...this.activities]);
    this.paginatorLength = this.filteredActivities().length;
    this.updatePaginatedActivities(this.activities);
    this.getCurrentLocation();
    this.setupSearchSubscription();
  }

  private getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          this.fulladdress = await this.geocodingService.geocodeLatLng({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
        },
        (error) => {
          console.warn('Geolocation not available:', error);
        }
      );
    }
  }

  private setupSearchSubscription(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterForm.patchValue({ name: searchTerm });
      this.applyFilters();
    });
  }

  openFilterBottomSheet(): void {
    const bottomSheetRef = this._bottomSheet.open(FilterBottomSheetComponent, {
      data: {
        currentFilters: this.filterForm.value,
        currentLocation: this.fulladdress
      },
      panelClass: 'filter-bottom-sheet-panel'
    });

    bottomSheetRef.afterDismissed().subscribe(filters => {
      if (filters) {
        this.filterForm.patchValue(filters);
        this.searchControl.setValue(filters.name || '', { emitEvent: false });
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.isLoading = true;

    this.activityService.getFilteredActivities(filters).subscribe({
      next: (response) => {
        this.filteredActivities.set(response);
        this.currentPage = 0;
        this.paginatorLength = this.filteredActivities().length;
        this.updatePaginatedActivities(this.filteredActivities());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching filtered activities', err);
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      location: '',
      distance: 25,
      season: '',
      weather: '',
      activityType: [],
      groupSize: 1,
      price: 100,
      name: '',
      freeActivities: false,
      familyFriendly: false,
      petFriendly: false,
      accessibleActivities: false
    });

    this.searchControl.setValue('', { emitEvent: false });
    this.filteredActivities.set([...this.activities]);
    this.currentPage = 0;
    this.paginatorLength = this.activities.length;
    this.updatePaginatedActivities(this.activities);
  }

  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return !!(
      formValue.location ||
      formValue.season ||
      formValue.weather ||
      (formValue.activityType && formValue.activityType.length > 0) ||
      formValue.groupSize > 1 ||
      formValue.price < 100 ||
      formValue.freeActivities ||
      formValue.familyFriendly ||
      formValue.petFriendly ||
      formValue.accessibleActivities ||
      this.searchControl.value
    );
  }

  removeFilter(filterName: string): void {
    const resetValues: any = {
      location: '',
      season: '',
      weather: '',
      activityType: [],
      groupSize: 1,
      price: 100,
      freeActivities: false,
      familyFriendly: false,
      petFriendly: false,
      accessibleActivities: false
    };

    if (Object.prototype.hasOwnProperty.call(resetValues, filterName)) {
      this.filterForm.patchValue({ [filterName]: resetValues[filterName] });
      this.applyFilters();
    }
  }

  getSeasonDisplayName(season: string): string {
    const seasonMap: Record<string, string> = {
      spring: 'Spring',
      summer: 'Summer',
      fall: 'Fall',
      winter: 'Winter'
    };
    return seasonMap[season] || season;
  }

  getWeatherDisplayName(weather: string): string {
    const weatherMap: Record<string, string> = {
      sunny: 'Sunny',
      rainy: 'Rainy',
      snowy: 'Snowy',
      cloudy: 'Cloudy'
    };
    return weatherMap[weather] || weather;
  }

  getResultsCountText(): string {
    const count = this.viewMode === 'bookmark' 
      ? this.bookmarkedActivities().length 
      : this.filteredActivities().length;
    
    if (count === 0) {
      return 'No activities found';
    } else if (count === 1) {
      return '1 activity found';
    } else {
      return `${count} activities found`;
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    
    const activities = this.viewMode === 'bookmark' 
      ? this.bookmarkedActivities()
      : this.filteredActivities();
    
    this.updatePaginatedActivities(activities);
  }

  updatePaginatedActivities(activities: MemoriseUserActivity[]): void {
    const startIndex = this.currentPage * this.pageSize;
    this.paginatedActivities = activities.slice(startIndex, startIndex + this.pageSize);
  }

  checkForBookmarking(viewMode: string): void {
    if (viewMode === 'bookmark') {
      this.paginatorLength = this.bookmarkedActivities().length;
      this.updatePaginatedActivities(this.bookmarkedActivities());
    } else {
      this.paginatorLength = this.filteredActivities().length;
      this.updatePaginatedActivities(this.filteredActivities());
    }
    this.currentPage = 0;
  }

  navigateToDetails(activityId: number): void {
    this.router.navigate(['activity/details/', activityId.toString()]);
  }
}