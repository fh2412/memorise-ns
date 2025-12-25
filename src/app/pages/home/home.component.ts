import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '@services/userService';
import { Router } from '@angular/router';
import { MemoryService } from '@services/memory.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Memory } from '@models/memoryInterface.model';
import { MemoriseUser } from '@models/userInterface.model';
import { firstValueFrom } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Auth } from '@angular/fire/auth';
import { BillingService } from '@services/billing.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit {
  private auth = inject(Auth);
  private userService = inject(UserService);
  private billingService = inject(BillingService);
  private router = inject(Router);
  private memoryService = inject(MemoryService);
  private _formBuilder = inject(FormBuilder);

  filterForm: FormGroup;
  openForm: FormGroup;
  userdb!: MemoriseUser;
  fuid: string | undefined;
  displayMemories: Memory[] = [];
  showFriendsMemoriesBool = true;

  sortOrder: 'asc' | 'desc' = 'desc';
  pageSize = 9;
  pageIndex = 0;
  totalItems = 0;
  pagedData: Memory[] = [];

  selectedValue = 'standard';
  noMemory = true;
  isLoading = false;

  // Cache for search results
  private searchCache: Memory[] = [];
  private isSearchActive = false;

  canCreateNewMemory = this.billingService.canCreateNewMemory;
  storageUsedGB = this.billingService.storageUsedGB;

  constructor() {
    this.filterForm = this._formBuilder.group({ showFilter: false });
    this.openForm = this._formBuilder.group({ search: '', showFriendsMemories: false });
  }

  async ngOnInit(): Promise<void> {
    const savedState = localStorage.getItem('showFriendsMemories');
    this.showFriendsMemoriesBool = savedState === 'true';
    this.openForm.get('showFriendsMemories')?.setValue(this.showFriendsMemoriesBool);
    try {
      await this.initializeUserData();
      await this.loadMemoriesPage();
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

  private async loadMemoriesPage(): Promise<void> {
    if (this.isSearchActive) {
      // If search is active, filter from cached results
      this.filterFromCache();
      return;
    }

    this.isLoading = true;
    try {
      const orderDirection = this.sortOrder === 'asc';
      let result;

      if (this.showFriendsMemoriesBool) {
        result = await firstValueFrom(
          this.memoryService.getUserCreatedAndAddedMemories(
            this.userdb.user_id,
            orderDirection,
            this.pageIndex,
            this.pageSize
          )
        );
      } else {
        result = await firstValueFrom(
          this.memoryService.getUserCreatedMemories(
            this.userdb.user_id,
            orderDirection,
            this.pageIndex,
            this.pageSize
          )
        );
      }

      this.pagedData = result.data || [];
      this.totalItems = result.total || 0;
      this.noMemory = this.totalItems === 0;
      this.displayMemories = this.pagedData;
    } catch (error) {
      console.error('Error loading memories:', error);
      this.pagedData = [];
      this.totalItems = 0;
      this.noMemory = true;
    } finally {
      this.isLoading = false;
    }
  }

  changeView(newView: string): void {
    this.selectedValue = newView;
  }

  async onPageChange(event: PageEvent): Promise<void> {
    this.pageIndex = event.pageIndex;
    await this.loadMemoriesPage();
  }

  async filterItems(): Promise<void> {
    const searchTerm = this.openForm.get('search')?.value?.toLowerCase() || '';

    if (!searchTerm) {
      // Clear search - go back to normal pagination
      this.isSearchActive = false;
      this.searchCache = [];
      this.pageIndex = 0;
      await this.loadMemoriesPage();
      return;
    }

    // Activate search mode - fetch ALL memories and cache them
    if (!this.isSearchActive || this.searchCache.length === 0) {
      await this.loadAllMemoriesForSearch();
    }

    this.isSearchActive = true;
    this.filterFromCache();
  }

  private async loadAllMemoriesForSearch(): Promise<void> {
    this.isLoading = true;
    try {
      const orderDirection = this.sortOrder === 'asc';
      let result;

      // Fetch all memories (with a large page size)
      if (this.showFriendsMemoriesBool) {
        result = await firstValueFrom(
          this.memoryService.getUserCreatedAndAddedMemories(
            this.userdb.user_id,
            orderDirection,
            0,
            10000 // Large number to get all memories
          )
        );
      } else {
        result = await firstValueFrom(
          this.memoryService.getUserCreatedMemories(
            this.userdb.user_id,
            orderDirection,
            0,
            10000
          )
        );
      }

      this.searchCache = result.data || [];
    } catch (error) {
      console.error('Error loading all memories for search:', error);
      this.searchCache = [];
    } finally {
      this.isLoading = false;
    }
  }

  private filterFromCache(): void {
    const searchTerm = this.openForm.get('search')?.value?.toLowerCase() || '';
    const filtered = this.searchCache.filter(item =>
      item.title.toLowerCase().includes(searchTerm)
    );

    this.totalItems = filtered.length;
    const startIndex = this.pageIndex * this.pageSize;
    this.pagedData = filtered.slice(startIndex, startIndex + this.pageSize);
    this.displayMemories = this.pagedData;
  }

  async toggleShowFriendsMemories(checked: boolean): Promise<void> {
    localStorage.setItem('showFriendsMemories', checked.toString());
    this.showFriendsMemoriesBool = checked;

    // Reset pagination and search
    this.pageIndex = 0;
    this.isSearchActive = false;
    this.searchCache = [];
    this.openForm.get('search')?.setValue('');

    await this.loadMemoriesPage();
  }

  async toggleSortOrder(): Promise<void> {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';

    // Reset pagination and search
    this.pageIndex = 0;
    this.isSearchActive = false;
    this.searchCache = [];

    await this.loadMemoriesPage();
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