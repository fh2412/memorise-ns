import { Component, inject } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';


export interface Activity {
  id: number;
  icon: string;
  name: string;
  genre: string;
}

@Component({
    selector: 'app-quick-activity-autocomplete',
    templateUrl: './quick-activity-autocomplete.component.html',
    styleUrl: './quick-activity-autocomplete.component.scss',
    imports: [
      CommonModule,
      MatAutocompleteModule,
      MatIconModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      ReactiveFormsModule,
      FormsModule,
  ],
})
export class QuickActivityAutocompleteComponent {
  private router = inject(Router);

  activityCtrl = new FormControl('');
  filteredActivities: Observable<Activity[]>;

  quickActivity = '';

  activities: Activity[] = [
    {
      id: 1,
      name: 'Hiking',
      icon: 'hiking',
      genre: 'Sports',
    },
    {
      id: 2,
      name: 'Vacation',
      icon: 'beach_access',
      genre: 'Free time',
    },
    {
      id: 3,
      name: 'Party',
      icon: 'cake',
      genre: 'Free time',
    },
  ];

  constructor() {
    this.filteredActivities = this.activityCtrl.valueChanges.pipe(
      startWith(''),
      map(activity => (activity ? this._filterStates(activity) : this.activities.slice())),
    );
  }

  private _filterStates(value: string): Activity[] {
    const filterValue = value.toLowerCase();

    return this.activities.filter(activity => activity.name.toLowerCase().includes(filterValue));
  }

  addMemory(): void {
    const selectedActivity = this.activities.find(
      (activity) => activity.name.toLowerCase() === this.quickActivity.trim().toLowerCase()
    );
  
    const activityId = selectedActivity ? selectedActivity.id : 0;
  
    this.router.navigate(['/newmemory'], {
      state: { quickActivity: this.quickActivity, activityId },
    });
  }
  
}
