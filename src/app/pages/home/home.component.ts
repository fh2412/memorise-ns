import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
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
  iamge = "https://images.freeimages.com/images/large-previews/996/easter-1399885.jpg";
  data = [
    { title: 'Card 1', description: 'Description 1', imageUrl: this.iamge },
    { title: 'Card 2', description: 'Description 2', imageUrl: this.iamge },
    { title: 'Card 3', description: 'Description 2', imageUrl: this.iamge },
    { title: 'Card 4', description: 'Description 2', imageUrl: this.iamge },
    { title: 'Card 5', description: 'Description 2', imageUrl: this.iamge },
    { title: 'Card 6', description: 'Description 2', imageUrl: this.iamge },
    { title: 'Card 7', description: 'Description 2', imageUrl: this.iamge },
    { title: 'Card 8', description: 'Description 2', imageUrl: this.iamge },
    { title: 'Card 9', description: 'Description 2', imageUrl: this.iamge },
    { title: 'Card 10', description: 'Description 2', imageUrl: this.iamge },
  ];

  pageSize = 9; // Number of items per page
  pageIndex = 0; // Current page index
  pagedData: any[] = [];

  constructor(private afAuth: AngularFireAuth, private userService: UserService, private router: Router, private memoryService: MemoryService) {
    this.loadData();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.loadData();
  }

  private loadData() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedData = this.data.slice(startIndex, endIndex);
  }

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
