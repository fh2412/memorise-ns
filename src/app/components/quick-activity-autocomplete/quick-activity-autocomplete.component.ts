import { Component } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';


export interface Activity {
  id: number;
  icon: string;
  name: string;
  genre: string;
}

@Component({
  selector: 'app-quick-activity-autocomplete',
  templateUrl: './quick-activity-autocomplete.component.html',
  styleUrl: './quick-activity-autocomplete.component.scss'
})
export class QuickActivityAutocompleteComponent {
  activityCtrl = new FormControl('');
  filteredStates: Observable<Activity[]>;

  quickActivity: string = '';

  states: Activity[] = [
    {
      id: 2,
      name: 'Hiking',
      icon: 'hiking',
      genre: 'Sports',
    },
    {
      id: 3,
      name: 'Vacation',
      icon: 'beach_access',
      genre: 'Free time',
    },
    {
      id: 4,
      name: 'Party',
      icon: 'cake',
      genre: 'Free time',
    },
  ];

  constructor( private router: Router) {
    this.filteredStates = this.activityCtrl.valueChanges.pipe(
      startWith(''),
      map(state => (state ? this._filterStates(state) : this.states.slice())),
    );
  }

  private _filterStates(value: string): Activity[] {
    const filterValue = value.toLowerCase();

    return this.states.filter(state => state.name.toLowerCase().includes(filterValue));
  }

  addMemory(): void {
    const selectedActivity = this.states.find(
      (activity) => activity.name.toLowerCase() === this.quickActivity.trim().toLowerCase()
    );
  
    const activityId = selectedActivity ? selectedActivity.id : 1;
  
    this.router.navigate(['/newmemory'], {
      state: { quickActivity: this.quickActivity, activityId },
    });
  }
  
}
