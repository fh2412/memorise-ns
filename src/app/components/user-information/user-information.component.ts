import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '@services/userService';
import { Router } from '@angular/router';
import { MemoriseUser } from '@models/userInterface.model';
import { take } from 'rxjs/operators';
import { MatCard, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-user-information',
    templateUrl: './user-information.component.html',
    styleUrls: ['./user-information.component.scss'],
    imports: [MatCard, MatCardTitle, MatCardSubtitle, MatButton, MatList, MatListItem, MatIcon, MatListItemIcon, MatListItemTitle, DatePipe]
})
export class UserInformationComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  userdb!: MemoriseUser;
  loggedInUserId: string | null = null;

  async ngOnInit(): Promise<void> {
    try {
      this.loggedInUserId = await this.userService.getLoggedInUserId() || '';
      this.loadUser();
    } catch (error) {
      console.error('Error fetching logged in user ID:', error);
    }
  }

  private loadUser(): void {
    if (this.loggedInUserId) {
      this.userService.getUser(this.loggedInUserId)
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.userdb = data;
          },
          (error: Error) => {
            console.error('Error fetching user data:', error);
          }
        );
    }
  }

  navigateToUserProfile(): void {
    if (this.userdb?.user_id) {
      this.router.navigate([`/userprofile/${this.userdb.user_id}`]);
    }
  }
}
