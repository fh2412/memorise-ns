import { Component } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/userService';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: './memory-detail.component.css'
})
export class MemoryDetailComponent {
  memorydb: any;
  memoryID: any;
  loggedInUserId: string | any;
  memorydbFriends: any;

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
  
    forkJoin([memoryObs, friendsObs]).subscribe(
      ([memoryData, friendsData]) => {
        this.memorydb = memoryData;
        this.memorydbFriends = friendsData;
        console.log("memorydb:", this.memorydb);
        console.log("memorydbFriends:", this.memorydbFriends);
      },
      (error: any) => {
        console.error('Error fetching memory data:', error);
      }
    );
  }
}
