import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { Router } from '@angular/router';
import { MemoriseUser } from '../../models/userInterface.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss']
})
export class UserInformationComponent implements OnInit {
  userdb!: MemoriseUser;
  loggedInUserId: string = '';

  constructor(
    private userService: UserService, 
    private router: Router
  ) {}

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
