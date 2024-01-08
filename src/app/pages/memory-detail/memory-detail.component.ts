import { Component } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: './memory-detail.component.css'
})
export class MemoryDetailComponent {
  memorydb: any;
  memoryID: any;

  constructor(private memoryService: MemoryService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.memoryID = params['id'];
    });
    console.log(this.memoryID);
    this.getMemoryInfo();
  }

  getMemoryInfo(): void {
    this.memoryService.getMemory(this.memoryID).subscribe(
      (data) => {
        this.memorydb = data;
      },
      (error: any) => {
        console.error('Error fetching user data:', error);
      }
    );
  }
}
