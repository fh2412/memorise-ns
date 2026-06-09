import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-plans',
  imports: [MatIcon],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
})
export class PlansComponent {

  private router = inject(Router);


  plannedMemories: any;

  onPlanWithFriends() {
    this.router.navigate(['/plans/start/crew']);
  }

}
