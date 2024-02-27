import { Component } from '@angular/core';
import {FormBuilder} from '@angular/forms';
import { MemoryService } from '../../services/memory.service';

@Component({
  selector: 'app-filterbar',
  templateUrl: './filterbar.component.html',
  styleUrl: './filterbar.component.scss'
})
export class FilterbarComponent {
  filterForm = this._formBuilder.group({
    showFilter: false,
  });
  openForm = this._formBuilder.group({
    search: '',
  });


  currentUser: any;
  userdb: any;
  data = [];

  pageSize = 9; // Number of items per page
  pageIndex = 0; // Current page index
  pagedData: any[] = [];

  constructor(private _formBuilder: FormBuilder, private memoryService: MemoryService) {}

  async ngOnInit() {
    await this.getCreatedMemories();
    this.loadData();
  }

  private async loadData() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedData = this.data.slice(startIndex, endIndex);
    console.log(this.pagedData);
  }

  async getCreatedMemories(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.memoryService.getCreatedMemory('4').subscribe(
        (data) => {
          this.data = data;
          resolve();  // Resolve the Promise when the operation is complete
        },
        (error: any) => {
          console.error('Error fetching createdMemory data:', error);
          reject(error);  // Reject the Promise if there is an error
        }
      );
    });
  }
}
