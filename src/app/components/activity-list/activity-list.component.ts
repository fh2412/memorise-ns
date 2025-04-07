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
import {MatExpansionModule} from '@angular/material/expansion';
import { ActivityCardComponent } from "../activity-card/activity-card.component"; 

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
  paginatedActivities: MemoriseUserActivity[] = [];
  
  viewMode: 'grid' | 'list' = 'grid';
  
  // Pagination properties
  pageSize = 12;
  currentPage = 0;
  
  // Form for filters
  filterForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
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
    console.log(this.activities);
    this.updatePaginatedActivities();
  }
  
  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredActivities = this.activities.filter(activity => {
      // Filter by name
      if (filters.name && !activity.title.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Filter by group size
      if (activity.groupSizeMax < filters.groupSizeMin || activity.groupSizeMin > filters.groupSizeMax) {
        return false;
      }
      
      // Filter by price
      if (activity.costs < filters.priceMin || activity.costs > filters.priceMax) {
        return false;
      }
      
      // Filter by season
      if (filters.season && activity.season !== filters.season) {
        return false;
      }
      
      // Filter by weather
      if (filters.weather && activity.weather !== filters.weather) {
        return false;
      }
      
      // Filter by location
      if (filters.location && activity.location.locality) {
        const locationMatch = activity.location.locality.toLowerCase().includes(filters.location.toLowerCase()) ||
                              activity.location.country.toLowerCase().includes(filters.location.toLowerCase());
        if (!locationMatch) {
          return false;
        }
      }
      
      return true;
    });
    
    // Reset to first page after applying filters
    this.currentPage = 0;
    this.updatePaginatedActivities();
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
    this.updatePaginatedActivities();
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedActivities();
  }
  
  updatePaginatedActivities(): void {
    const startIndex = this.currentPage * this.pageSize;
    this.paginatedActivities = this.filteredActivities.slice(startIndex, startIndex + this.pageSize);
  }
  
  // Helper method for distance calculation (not implemented yet)
  //calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula for calculating distance between two points on Earth
    // To be implemented
  //  return 0;
  //}
}
