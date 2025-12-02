// join-memory-page.component.ts
// Create this file in: src/app/components/join-memory-page/join-memory-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { JoinMemoryDialogComponent } from '../../components/_dialogs/join-memory-dialog/join-memory-dialog.component';

@Component({
  selector: 'app-join-memory-page',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="join-memory-page">
      <p>Loading memory invite...</p>
    </div>
  `,
  styles: [`
    .join-memory-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-size: 16px;
      color: #666;
    }
  `]
})
export class JoinMemoryPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private router = inject(Router);


  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    
    if (token) {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        this.openJoinDialog(token);
      }, 300);
    }
  }

  openJoinDialog(token: string) {
    const dialogRef = this.dialog.open(JoinMemoryDialogComponent, {
      width: '900px',
      disableClose: false,
      data: { token }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Dialog handles navigation, so we don't need to do anything here
      if (!result) {
        this.router.navigate(['/home']);
      }
    });
  }
}