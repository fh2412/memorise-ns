import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivityCardComponent } from "../activity-card/activity-card.component";
import { Router } from '@angular/router';
import { ActivityService } from '../../services/activity.service';
import { BookmarkService } from '../../services/bookmarking.service';
import { NotFoundComponent } from "../not-found/not-found.component";
import { PlacesSearchComponent } from "../places-search/places-search.component";

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
    ActivityCardComponent,
    NotFoundComponent,
    PlacesSearchComponent
],
})
export class ActivityListComponent implements OnInit {
  @Input() activities: MemoriseUserActivity[] = [];

  filteredActivities: WritableSignal<MemoriseUserActivity[]> = signal([]);
  bookmarkedActivities: MemoriseUserActivity[] = [];
  paginatedActivities: MemoriseUserActivity[] = [];
  paginatorLength = 0;
  viewMode: 'grid' | 'list' | 'bookmark' = 'grid';
  pageSize = 12;
  currentPage = 0;
  filterForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private activityService: ActivityService, private bookmarkedService: BookmarkService) {
    this.filterForm = this.fb.group({
      location: [''],
      distance: [25],
      tag: [''],
      groupSize: [0],
      price: [100],
      season: [''],
      weather: [''],
      name: ['']
    });
  }

  ngOnInit(): void {
    this.filteredActivities.set([...this.activities]);
    this.paginatorLength = this.filteredActivities.length;
    this.bookmarkedService.bookmarkedActivities$.subscribe((data) => {
      this.bookmarkedActivities = data;
    });
    this.updatePaginatedActivities(this.activities);
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    console.log(filters);

    this.activityService.getFilteredActivities(filters).subscribe({
      next: (response) => {
        this.filteredActivities.set(response);
        this.currentPage = 0;
        this.updatePaginatedActivities(this.filteredActivities());
      },
      error: (err) => {
        console.error('Error fetching filterd activities', err);
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      location: '',
      distance: 25,
      tag: '',
      groupSize: 0,
      price: 100,
      season: '',
      weather: '',
      name: ''
    });

    this.filteredActivities.set([...this.activities]);
    this.currentPage = 0;
    this.updatePaginatedActivities(this.activities);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedActivities(this.activities);
  }

  updatePaginatedActivities(activities: MemoriseUserActivity[]): void {
    const startIndex = this.currentPage * this.pageSize;
    this.paginatedActivities = activities.slice(startIndex, startIndex + this.pageSize);
  }

  checkForBookmarking(viewMode: string) {
    if (viewMode === 'bookmark') {
      this.paginatorLength = this.bookmarkedActivities.length;
    }
    else {
      this.paginatorLength = this.filteredActivities().length;
    }
  }

  navigateToDetails(activityId: number) {
    this.router.navigate(['activity/details/', activityId.toString()]);
  }
}
