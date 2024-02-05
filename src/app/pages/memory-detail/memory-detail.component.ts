import { Component } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/userService';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: './memory-detail.component.scss'
})
export class MemoryDetailComponent {
  memorydb: any;
  memoryID: any;
  loggedInUserId: string | any;
  memorydbFriends: any;
  selectedDate = new Date(2024, 1, 1); // Set your specific date here

  constructor(private memoryService: MemoryService, private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.route.params.subscribe(params => {
      this.memoryID = params['id'];
    });
    this.getMemoryInfo();
  }

  getMemoryInfo(): void {
    const memoryObs = this.memoryService.getMemory(this.memoryID);
    const friendsObs = this.memoryService.getMemorysFriends(this.memoryID, this.loggedInUserId);
  
    memoryObs.subscribe(
      (memoryData) => {
        this.memorydb = memoryData;
        this.selectedDate = new Date(this.memorydb.memory_date);
      },
      (error: any) => {
        console.error('Error fetching memory data:', error);
      }
    );
  
    friendsObs.subscribe(
      (friendsData) => {
        if (friendsData.length === 0) {
          // Set a default value when there are no friends
          this.memorydbFriends = 'There are no friends added to the memory yet!';
        } else {
          this.memorydbFriends = friendsData;
          console.log(this.memorydbFriends);
        }
      },
      (error: any) => {
        console.error('Error fetching friends data:', error);
        // Set an error message or handle the error as needed
        this.memorydbFriends = 'Error fetching friends data';
      }
    );
  }
  
  
}
