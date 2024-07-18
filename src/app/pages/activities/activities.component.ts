import { Component } from '@angular/core';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss'
})
export class ActivitiesComponent {
  addActivity(){
    console.log("Add Activity");
  };
}
