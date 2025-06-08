import { Component, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivityService } from '../../services/activity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/userService';
import { ActivityDetails } from '../../models/activityInterface.model';
import { ActivityFormComponent } from '../../components/activity-form/activity-form.component';


@Component({
  selector: 'app-edit-activity',
  standalone: false,
  templateUrl: './edit-activity.component.html',
  styleUrl: './edit-activity.component.scss'
})
export class EditActivityComponent implements OnInit {
  isLoading = true;
  activityId: string | null = null;
  userId: string | null = null;
  activity!: ActivityDetails;

  @ViewChild(ActivityFormComponent) activityFormComponent!: ActivityFormComponent;

  constructor(private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private activityService: ActivityService, private snackBar: MatSnackBar, private userService: UserService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.activityId = params.get('id');
        if (!this.activityId) {
          throw new Error('Activity ID is required');
        }
        return this.activityService.getActivityDetails(this.activityId);
      })
    ).subscribe({
      next: (data) => {
        this.activity = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching activity details', error);
        this.isLoading = false;
      }
    });
    this.userService.userId$.subscribe(userId => {
      this.userId = userId;
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

  async updateActivity(): Promise<void> {
    const confirmed = await this.openConfirmationDialog('Update Activity', 'This will update the activity for every User already using it for a memory. Are you sure you want to update?');
    this.isLoading = true;
    if (confirmed && this.activityId) {
      const updatedActivityData = this.activityFormComponent.getFormData();
      console.log(updatedActivityData);
      this.activityService.updateUserActivity(this.activityId, updatedActivityData).subscribe({
        next: () => {
          const newImage = this.activityFormComponent.getImageFile();
          if (newImage && this.activityId && this.activity) {
            this.activityService.changeTitlePicture(newImage, this.activityId, this.activity.firebaseUrl)
              .subscribe({
                next: () => {
                  this.finishUpdate();
                },
                error: (error) => {
                  console.error('Error uploading Image', error);
                }
              });
          } else {
            this.finishUpdate();
          }
        },
        error: (error) => {
          console.error('Error fetching activity creator details', error);
          this.isLoading = false;
        }
      });
    }
  }

  finishUpdate(): void {
    this.isLoading = false;
    this.router.navigate(['activity/overview/', this.userId]);
    this.snackBar.open('Activity successfully updated', 'Ok', { duration: 3000, verticalPosition: 'bottom' });
  }

  openConfirmationDialog(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: { title, message }
    });
    return firstValueFrom(dialogRef.afterClosed());
  }
}
