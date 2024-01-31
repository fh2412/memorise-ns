import { Component, Input } from '@angular/core';
import { MemorystatsService } from '../../services/memorystats.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent {
  @Input() userid: string = '';
  memoryCount: any;
  memoryThisYearCount: any;
  friendsCount: any;

  constructor (private memorystatsService: MemorystatsService) {}
  
  ngOnInit(): void {
    this.getMemoryStats();
  }

  getMemoryStats(): void {
    this.memorystatsService.getMemoryCount(this.userid).subscribe(
      (data) => {
        this.memoryCount = data[0].count;
      },
      (error: any) => {
        console.error('Error fetching MemoryCount', error);
      }
    );
    this.memorystatsService.getMemoryCountThisYear(this.userid).subscribe(
      (data) => {
        this.memoryThisYearCount = data[0].count;
      },
      (error: any) => {
        console.error('Error fetching MemoryCount', error);
      }
    );
    this.memorystatsService.getFriendsCount(this.userid).subscribe(
      (data) => {
        this.friendsCount = data[0].count;
      },
      (error: any) => {
        console.error('Error fetching MemoryCount', error);
      }
    );
  }
}
