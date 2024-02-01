import { Component, Input } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-editmemory',
  templateUrl: './editmemory.component.html',
  styleUrl: './editmemory.component.css'
})
export class EditmemoryComponent {
  memoryId: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private memoryService: MemoryService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.memoryId = params.get('id')!;
      console.log("MemoryID:", this.memoryId);
    });
  }

  deleteMemory() {
    this.memoryService.deleteMemoryAndFriends(this.memoryId).subscribe(
      (response) => {
        console.log('Memory and friends deleted successfully:', response);
        window.location.reload();
        // Handle success, e.g., update UI
      },
      (error) => {
        console.error('Error deleting memory and friends:', error);
        // Handle error, e.g., show an error message
      }
    );
    this.router.navigate(['/home']);
  }
}
