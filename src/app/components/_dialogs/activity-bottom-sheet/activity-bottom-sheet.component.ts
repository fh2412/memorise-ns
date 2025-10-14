import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivityDetails, MemoriseUserActivity, ActivityFilter } from '../../../models/activityInterface.model';
import { ActivityService } from '../../../services/activity.service';

export interface ActivityBottomSheetData {
  activityId: number | string;
  memoryId: string;
  loggedInUserId: string;
}

@Component({
  selector: 'app-activity-bottom-sheet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: 'activity-bottom-sheet.component.html',
  styleUrls: ['activity-bottom-sheet.component.scss'],
})
export class ActivityBottomSheetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentActivity: ActivityDetails | null = null;
  searchTerm = '';
  searchResults: MemoriseUserActivity[] = [];
  selectedActivity: MemoriseUserActivity | null = null;
  isLoading = false;
  isSaving = false;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ActivityBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: ActivityBottomSheetData,
    @Inject(ActivityService) private activityService: ActivityService
  ) { }

  ngOnInit(): void {
    if (this.data.activityId) {
      this.loadCurrentActivity();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentActivity(): void {
    this.activityService.getActivityDetails(this.data.activityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activity) => {
          this.currentActivity = activity;
          console.log(this.currentActivity);
        },
        error: (error) => {
          console.error('Error loading current activity:', error);
        }
      });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;

    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      return;
    }

    this.performSearch();
  }

  private performSearch(): void {
    if (!this.searchTerm.trim()) {
      return;
    }

    this.isLoading = true;

    const filter: ActivityFilter = {
      name: this.searchTerm.trim(),
      locationCoords: {lat: 0, lng: 0},
      price: -1
    };

    this.activityService.getFilteredActivities(filter, this.data.loggedInUserId)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (activities) => {
          this.searchResults = activities;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching activities:', error);
          this.isLoading = false;
          this.searchResults = [];
        }
      });
  }

  onActivitySelect(event: MatSelectionListChange): void {
    const selectedOptions = event.source.selectedOptions.selected;
    if (selectedOptions.length > 0) {
      this.selectedActivity = selectedOptions[0].value;
    } else {
      this.selectedActivity = null;
    }
  }

  saveActivity(): void {
    if (!this.selectedActivity) {
      return;
    }

    this.isSaving = true;

    this.activityService.updateMemoriesActivity(this.selectedActivity.activityId, this.data.memoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          if (response.message) {
            this.bottomSheetRef.dismiss({
              success: true,
              selectedActivity: this.selectedActivity
            });
          } else {
            console.error('Failed to update activity:', response.message);
            // You might want to show a snackbar or other error notification here
          }
        },
        error: (error) => {
          console.error('Error updating activity:', error);
          this.isSaving = false;
          // You might want to show a snackbar or other error notification here
        }
      });
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}