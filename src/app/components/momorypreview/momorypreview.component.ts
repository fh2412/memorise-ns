import { Component } from '@angular/core';
import { MockMemoryService } from '../../services/mocks/MockMemoryService';


@Component({
  selector: 'app-momorypreview',
  templateUrl: './momorypreview.component.html',
  styleUrl: './momorypreview.component.css'
})
export class MomorypreviewComponent {
  memories: any[] = [];; // Define your memory data structure here

  constructor(private memoryService: MockMemoryService) {}

  ngOnInit(): void {
    this.getmemoryInfo();
  }

  getmemoryInfo(): void {
    this.memoryService.getMemories().subscribe(
      (memoryData: any[]) => {
        this.memories = memoryData;
      },
      (error: any) => {
        console.error('Error fetching memory data:', error);
      }
    );
  }

  openEditForm(): void {
    // Implement logic to open the edit form
    // This might involve routing to another component or opening a dialog/modal
    // You can use Angular Material Dialog for this purpose
    // Example: this.dialog.open(EditFormComponent);
  }

}
