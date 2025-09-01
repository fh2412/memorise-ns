import { Component, Input, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { ActivityService } from '../../../services/activity.service';
import { MemoriseUserActivity } from '../../../models/activityInterface.model';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-bottom-sheet',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSliderModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  templateUrl: './filter-bottom-sheet.component.html',
  styleUrl: './filter-bottom-sheet.component.scss'
})
export class FilterBottomSheetComponent {

  filterForm: FormGroup;
  filteredActivities: WritableSignal<MemoriseUserActivity[]> = signal([]);
  @Input() activities: MemoriseUserActivity[] = [];


  constructor(private fb: FormBuilder, private activityService: ActivityService) {
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

  applyFilters(): void {
    const filters = this.filterForm.value;
    console.log(filters);

    this.activityService.getFilteredActivities(filters).subscribe({
      next: (response) => {
        this.filteredActivities.set(response);
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
  }

}
