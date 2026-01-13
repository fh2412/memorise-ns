import { Component, OnInit, inject, input } from '@angular/core';
import { MemorystatsService } from '@services/memorystats.service';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MemoryDisplayStats } from '@models/memoryInterface.model';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss',
    imports: [MatCardModule]
})
export class StatsComponent implements OnInit {
  private memorystatsService = inject(MemorystatsService);

  readonly userid = input('');
  displayStats: MemoryDisplayStats = {
    memoryCount: 0,
    yearCount: 0,
    allCount: 0,
    friendCount: 0
  };
  dbConnection = true;
  loading = true;
  
  ngOnInit(): void {
    this.getMemoryStats();
  }

  async getMemoryStats(): Promise<void> {
    this.loading = true;
    try {
        this.displayStats = await firstValueFrom(this.memorystatsService.getDisplayStats(this.userid()));
    } finally {
        this.loading = false;
    }
}
}
