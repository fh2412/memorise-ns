import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plans',
  imports: [],
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
