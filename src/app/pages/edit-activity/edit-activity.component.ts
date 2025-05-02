import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivityService } from '../../services/activity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-edit-activity',
  standalone: false,
  templateUrl: './edit-activity.component.html',
  styleUrl: './edit-activity.component.scss'
})
export class EditActivityComponent implements OnInit {
  isLoading = false;
  activityId: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private activityService: ActivityService, private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.activityId = params.get('id');
    });
  }

  async deleteActivity(status: string): Promise<void> {
    const confirmed = await this.openConfirmationDialog('Confirm ' + status, `Are you sure you want to ${status} this activity?`);
    this.isLoading = true;
    if (confirmed && status === 'archive' && this.activityId) {
      this.activityService.archiveActivity(this.activityId).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['activities']);
          this.snackBar.open('Activity successfully archived', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        },
        error: (error) => {
          console.error('Error fetching activity creator details', error);
          this.isLoading = false;
        }
      });
    }
  }

  openConfirmationDialog(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: { title, message }
    });
    return firstValueFrom(dialogRef.afterClosed());
  }
}
