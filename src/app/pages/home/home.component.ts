import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../../services/userService';
import { Router } from '@angular/router';
import { MemoryService } from '../../services/memory.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Memory } from '../../models/memoryInterface.model';
import { MemoriseUser } from '../../models/userInterface.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  filterForm: FormGroup;
  openForm: FormGroup;
  userdb!: MemoriseUser;
  userGeneratedMemories: Memory[] = [];
  friendGeneratedMemories: Memory[] = [];
  displayMemories: Memory[] = [];

  pageSize = 9;
  pageIndex = 0;
  pagedData: Memory[] = [];
  filteredItems: Memory[] = [];

  selectedValue: string = 'standard';
  noMemory: boolean = true;

  constructor(
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private router: Router,
    private memoryService: MemoryService,
    private _formBuilder: FormBuilder
  ) {
    this.filterForm = this._formBuilder.group({ showFilter: false });
    this.openForm = this._formBuilder.group({ search: '', showFriendsMemories: false });
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.initializeUserData();
      await this.loadMemories();
      this.initializeDataDisplay();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  private async initializeUserData(): Promise<void> {
    const user = await firstValueFrom(this.afAuth.authState);
    if (!user?.email) throw new Error('No authenticated user found');

    this.userdb = await firstValueFrom(this.userService.getUser(user.uid));
    if (this.userdb?.user_id) {
      this.userService.setLoggedInUserId(this.userdb.user_id);
    }
  }

  private async loadMemories(): Promise<void> {
    try {
      await this.getCreatedMemories();
      await this.getAddedMemories();
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  }

  private initializeDataDisplay(): void {
    this.displayMemories = [...this.userGeneratedMemories];
    this.filteredItems = [...this.displayMemories];
    this.updatePagedData();
  }

  changeView(newView: string): void {
    this.selectedValue = newView;
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.updatePagedData();
  }

  filterItems(): void {
    const searchTerm = this.openForm.get('search')?.value?.toLowerCase() || '';
    this.filteredItems = this.noMemory
      ? []
      : this.displayMemories.filter(item => item.title.toLowerCase().includes(searchTerm));
    this.updatePagedData();
  }

  showAll(checked: boolean): void {
    this.displayMemories = checked && this.friendGeneratedMemories.length > 0
      ? [...this.userGeneratedMemories, ...this.friendGeneratedMemories]
      : [...this.userGeneratedMemories];

    if (this.openForm.get('search')?.value) {
      this.filterItems();
    } else {
      this.filteredItems = [...this.displayMemories];
      this.updatePagedData();
    }
  }

  private updatePagedData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.pagedData = this.filteredItems.slice(startIndex, startIndex + this.pageSize);
  }

  private async getCreatedMemories(): Promise<void> {
    try {
      const data = await firstValueFrom(this.memoryService.getCreatedMemory(this.userdb.user_id));
      this.userGeneratedMemories = data.message === "You haven't created any memories yet!" ? [] : data;
      this.noMemory = this.userGeneratedMemories.length === 0;
    } catch (error) {
      console.error('Error fetching user-created memories:', error);
    }
  }

  private async getAddedMemories(): Promise<void> {
    try {
      this.friendGeneratedMemories = await firstValueFrom(this.memoryService.getAddedMemories(this.userdb.user_id));
    } catch (error) {
      console.error("Error fetching friend's memories data:", error);
    }
  }

  addMemory(): void {
    this.router.navigate(['/setactivity']);
  }

  openDetailedMemory(memoryId: number): void {
    this.router.navigate(['memory/', memoryId]);
  }
}
