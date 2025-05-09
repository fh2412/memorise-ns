import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-set-memories-activity',
    templateUrl: './set-memories-activity.component.html',
    styleUrl: './set-memories-activity.component.scss',
    standalone: false
})
export class SetMemoriesActivityComponent {
  quickActivity = '';

  constructor(private router: Router) {  }

  addMemory(): void {
    this.router.navigate(['/newmemory'], { state: { quickActivity: this.quickActivity } });
  }

  navigateCreateActivity(): void {
    this.router.navigate(['activity/create']);
  }
}
