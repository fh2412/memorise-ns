import { Component, Input } from '@angular/core';
import { MemorystatsService } from '../../services/memorystats.service';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  @Input() userid: string = '';
  memoryCount: number = 0;
  memoryThisYearCount: number = 0;
  friendsCount: number = 0;

  constructor (private memorystatsService: MemorystatsService) {}
  
  ngOnInit(): void {
    this.getMemoryStats();
  }

  getMemoryStats(): void {
    forkJoin({
      memoryCount: this.memorystatsService.getMemoryCount(this.userid),
      memoryThisYearCount: this.memorystatsService.getMemoryCountThisYear(this.userid),
      friendsCount: this.memorystatsService.getFriendsCount(this.userid)
    })
    .pipe(
      catchError(error => {
        console.error('Error fetching statistics', error);
        return [];
      })
    )
    .subscribe(({ memoryCount, memoryThisYearCount, friendsCount }) => {
      this.memoryCount = memoryCount[0]?.count || 0;
      this.memoryThisYearCount = memoryThisYearCount[0]?.count || 0;
      this.friendsCount = friendsCount[0]?.count || 0;
    });
  }
}
