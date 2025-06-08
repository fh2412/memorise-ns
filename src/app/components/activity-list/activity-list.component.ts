import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
    ActivityCardComponent
  ],
})
export class ActivityListComponent implements OnInit {
  @Input() activities: MemoriseUserActivity[] = [];

  filteredActivities: MemoriseUserActivity[] = [];
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
      groupSizeMin: [1],
      groupSizeMax: [20],
      price: [0],
      season: [''],
      weather: [''],
      name: ['']
    });
  }

  ngOnInit(): void {
    this.filteredActivities = [...this.activities];
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
        this.filteredActivities = response;
      },
      error: (err) => {
        console.error('Error fetching company', err);
      }
    });

    // Reset to first page after applying filters
    this.currentPage = 0;
    this.updatePaginatedActivities(this.activities);
  }

  resetFilters(): void {
    this.filterForm.reset({
      location: '',
      distance: 25,
      tag: '',
      groupSizeMin: 1,
      groupSizeMax: 20,
      price: 0,
      season: '',
      weather: '',
      name: ''
    });

    this.filteredActivities = [...this.activities];
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

  checkForBookmarking(viewMode: string){
    if(viewMode === 'bookmark'){
      this.paginatorLength = this.bookmarkedActivities.length;
    }
    else{
      this.paginatorLength = this.filteredActivities.length;
    }
  }

  navigateToDetails(activityId: number) {
    this.router.navigate(['activity/details/', activityId.toString()]);
  }
}
