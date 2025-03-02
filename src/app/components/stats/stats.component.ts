import { Component, Input, OnInit } from '@angular/core';
import { MemorystatsService } from '../../services/memorystats.service';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss',
    standalone: false
})
export class StatsComponent implements OnInit {
  @Input() userid = '';
  memoryCount = 0;
  memoryThisYearCount = 0;
  friendsCount = 0;
  dbConnection = true;

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
        this.dbConnection = false;
        return [];
      })
    )
    .subscribe(({ memoryCount, memoryThisYearCount, friendsCount }) => {
      this.memoryCount = memoryCount?.count || 0;
      this.memoryThisYearCount = memoryThisYearCount?.count || 0;
      this.friendsCount = friendsCount?.count || 0;
    });
  }
}
