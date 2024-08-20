import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss']
})
export class UserInformationComponent implements OnInit {
  userdb: any;
  currentUser: any;

  constructor(private userService: UserService, 
    private afAuth: AngularFireAuth,  
    private router: Router) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    this.afAuth.authState.subscribe(user => {
        this.currentUser = user;
        this.userService.getUserByEmail(this.currentUser.email).subscribe(
          (data) => {
            this.userdb = data;
          },
          (error: any) => {
            console.error('Error fetching user data:', error);
          }
        );
    });
  }

  navigateToUserProfile() {
    this.router.navigate([`/userprofile/${this.userdb.user_id}`]);
  }
}
