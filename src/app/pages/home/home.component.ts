import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { Router } from '@angular/router';
import { MemoryService } from '../../services/memory.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Memory } from '../../models/memoryInterface.model';
import { MemoriseUser } from '../../models/userInterface.model';
import { firstValueFrom } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Auth } from '@angular/fire/auth';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit {
  filterForm: FormGroup;
  openForm: FormGroup;
  userdb!: MemoriseUser;
  fuid: string | undefined;
  databaseMemories: Memory[] = [];
  displayMemories: Memory[] = [];
  showFriendsMemoriesBool = true;

  sortOrder: 'asc' | 'desc' = 'desc';
  pageSize = 9;
  pageIndex = 0;
  pagedData: Memory[] = [];
  filteredItems: Memory[] = [];

  selectedValue = 'standard';
  noMemory = true;

  canCreateNewMemory = this.billingService.canCreateNewMemory;
  storageUsedGB = this.billingService.storageUsedGB;

  constructor(
    private auth: Auth,
    private userService: UserService,
    private billingService: BillingService,
    private router: Router,
    private memoryService: MemoryService,
    private _formBuilder: FormBuilder
  ) {
    this.filterForm = this._formBuilder.group({ showFilter: false });
    this.openForm = this._formBuilder.group({ search: '', showFriendsMemories: false });
  }

  async ngOnInit(): Promise<void> {
    const savedState = localStorage.getItem('showFriendsMemories');
    this.showFriendsMemoriesBool = savedState === 'true';
    this.openForm.get('showFriendsMemories')?.setValue(this.showFriendsMemoriesBool);
    try {
      await this.initializeUserData();
      await this.loadMemories();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  private async initializeUserData(): Promise<void> {
    const user = this.auth.currentUser;
    this.fuid = this.auth.currentUser?.uid;
    if (!user?.email) throw new Error('No authenticated user found');

    this.userdb = await firstValueFrom(this.userService.getUser(user.uid));
    if (this.userdb?.user_id) {
      this.userService.setLoggedInUserId(this.userdb.user_id);
      const useraccount = await firstValueFrom(this.userService.getUserAccountType(user.uid));
      this.billingService.setUserStorageData({
        userId: user.uid,
        accountType: useraccount.accountType,
        storageUsedBytes: useraccount.storageUsedBytes
      });
    }
  }

  private async loadMemories(): Promise<void> {
    try {
      if (this.showFriendsMemoriesBool) {
        await this.getCreatedAndAddedMemories();
      } else {
        await this.getUserCreatedMemoriesOnly();
      }
      this.initializeDataDisplay();
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  }

  private async getUserCreatedMemoriesOnly(): Promise<void> {
    const orderDirection = this.sortOrder === 'asc';
    try {
      const data = await firstValueFrom(this.memoryService.getUserCreatedMemories(this.userdb.user_id, orderDirection));
      this.databaseMemories = data;
      this.noMemory = this.databaseMemories.length === 0;
    } catch (error) {
      console.error('Error fetching user-created memories:', error);
    }
  }

  private async getCreatedAndAddedMemories(): Promise<void> {
    const orderDirection = this.sortOrder === 'asc';
    try {
      this.databaseMemories = await firstValueFrom(this.memoryService.getUserCreatedAndAddedMemories(this.userdb.user_id, orderDirection ));
      this.noMemory = this.databaseMemories.length === 0;
    } catch (error) {
      console.error("Error fetching friend's memories data:", error);
    }
  }

  private initializeDataDisplay(): void {
    if (!this.noMemory) {
      if (this.databaseMemories.length > 0) {
        this.displayMemories = this.databaseMemories;
      } else {
        this.displayMemories = [];
      }
      this.filteredItems = [...this.displayMemories];
    }

    this.updatePagedData();
  }

  changeView(newView: string): void {
    this.selectedValue = newView;
  }

  onPageChange(event: PageEvent): void {
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

  async toggleShowFriendsMemories(checked: boolean): Promise<void> {
    localStorage.setItem('showFriendsMemories', checked.toString());
    this.showFriendsMemoriesBool = checked;
    if (!this.noMemory || this.databaseMemories.length > 0) {
      if (checked) {
        await this.getCreatedAndAddedMemories();
      }
      else {
        await this.getUserCreatedMemoriesOnly();
      }
      this.displayMemories = this.filteredItems = [...this.databaseMemories];
    }

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

  async toggleSortOrder(): Promise<void> {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    await this.loadMemories();
  }

  getDisabledTooltip(): string {
    if (this.canCreateNewMemory()) {
      return '';
    }
    return `Storage limit reached. Free users are limited to 5 GB. Current usage: ${this.storageUsedGB().toFixed(2)} GB. Please upgrade to Premium or Corporate for unlimited storage.`;
  }

  addMemory(): void {
    this.router.navigate(['/newmemory'], { state: { activityId: 1 } });
  }

  openDetailedMemory(memoryId: number): void {
    this.router.navigate(['memory/', memoryId]);
  }
}
