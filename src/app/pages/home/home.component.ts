import { Component } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/compat/auth';
import { UserService } from '../../services/userService';
import { Router } from '@angular/router';
import { MemoryService } from '../../services/memory.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentUser: any;
  userdb: any;
  constructor(private afAuth: AngularFireAuth, private userService: UserService, private router: Router, private memoryService: MemoryService) {}

ngOnInit() {
  this.setUserId();
}

setUserId(): void {
  this.afAuth.authState.subscribe(user => {
    this.currentUser = user;
    this.userService.getUserByEmail(this.currentUser.email).subscribe(
      (data) => {
        this.userdb = data;
        if (this.userdb) {
          this.userService.setLoggedInUserId(this.userdb.user_id);
        }
      },
      (error: any) => {
        console.error('Error fetching user data:', error);
      }
    );
  });
}

addMemory() {
  this.router.navigate(['/newmemory']);
}
}
