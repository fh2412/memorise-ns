import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@services/userService';

@Component({
  selector: 'app-set-memories-activity',
  templateUrl: './set-memories-activity.component.html',
  styleUrl: './set-memories-activity.component.scss',
  standalone: false,
})
export class SetMemoriesActivityComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  quickActivity = '';
  loggedInUserId: string | null = null;

  async ngOnInit() {
    this.loggedInUserId = this.userService.getLoggedInUserId();
  }

  onActivitySelected(activityId: number) {
    this.router.navigate(['/newmemory'], { state: { activityId: activityId } });
  }

  navigateToCreateNewActivity(): void {
    this.router.navigate(['/activity/create']);
  }
}
