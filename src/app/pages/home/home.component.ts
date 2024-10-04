import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../../services/userService';
import { Router } from '@angular/router';
import { MemoryService } from '../../services/memory.service';
import { FormBuilder } from '@angular/forms';
import { ViewSelecorComponent } from '../../components/view-selecor/view-selecor.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  filterForm = this._formBuilder.group({
    showFilter: false,
  });
  openForm: any;
  currentUser: any;
  userdb: any;
  data: any[] = [];
  friendsdata: any[] = [];
  displaydata: any[] = [];

  pageSize = 9; // Number of items per page
  pageIndex = 0; // Current page index
  pagedData: any[] = [];
  filteredItems: any[] = [];

  selectedValue: string = 'standard'; // Set default value for view
  noMemory: boolean = true;

  constructor(private afAuth: AngularFireAuth, private userService: UserService, private router: Router, private memoryService: MemoryService, private _formBuilder: FormBuilder, private viewSelector: ViewSelecorComponent) {
    this.openForm = this._formBuilder.group({
      search: '',
      showFriendsMemories: false,
    });
  }


  async ngOnInit() {
    await this.setUserId();
    await this.getCreatedMemories();
    await this.getAddedMemories();
    this.displaydata = this.data;
    this.filteredItems = this.displaydata;
    this.loadData();
  }

  changeView(newView: string) {
    this.selectedValue = newView; // Update component state
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.loadData();
  }

  filterItems() {
    if (!this.noMemory) {
      const searchTerm = this.openForm.get('search').value.toLowerCase();
      this.filteredItems = this.displaydata.filter(item =>
        item.title.toLowerCase().includes(searchTerm)
      );
      this.loadData();
    }
  }

  showAll(checked: boolean) {
    if (checked) {
      this.displaydata = [...this.data, ...this.friendsdata];
    }
    else {
      this.displaydata = this.data;
    }
    if (this.openForm.get('search').value.toLowerCase()) {
      this.filterItems();
    }
    else {
      this.filteredItems = this.displaydata;
      this.loadData();
    }
  }

  private async loadData() {
    if (!this.noMemory) {
      const startIndex = this.pageIndex * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.pagedData = this.filteredItems.slice(startIndex, endIndex);
    }
  }

  async setUserId(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.authState.subscribe(user => {
        this.currentUser = user;
        this.userService.getUserByEmail(this.currentUser.email).subscribe(
          (data) => {
            this.userdb = data;
            if (this.userdb) {
              this.userService.setLoggedInUserId(this.userdb.user_id);
            }
            resolve();  // Resolve the Promise when the operation is complete
          },
          (error: any) => {
            console.error('Error fetching user data:', error);
            reject(error);  // Reject the Promise if there is an error
          }
        );
      });
    });
  }


  addMemory() {
    this.router.navigate(['/newmemory']);
  }

  openDetaildMemorie(memoryid: string) {
    this.router.navigate(['memory/', memoryid]);
  }

  async getCreatedMemories(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.memoryService.getCreatedMemory(this.userdb.user_id).subscribe(
        (data) => {
          if (data.message != 'You haven\'t created any memories yet!') {
            this.data = data;
            this.noMemory = false;
          }
          else {
            this.noMemory = true;
          }
          resolve();
        },
        (status: 200) => {
          reject(status);
        }
      );
    });
  }

  async getAddedMemories(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.memoryService.getAddedMemories(this.userdb.user_id).subscribe(
        (data) => {
          this.friendsdata = data;
          resolve();
        },
        (error: any) => {
          console.error('Error fetching createdMemory data:', error);
          reject(error);  // Reject the Promise if there is an error
        }
      );
    });
  }
}
