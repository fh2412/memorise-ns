// join-memory-dialog.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Memory } from '@models/memoryInterface.model';
import { MemoryService } from '@services/memory.service';
import { LoadingSpinnerComponent } from "@components/loading-spinner/loading-spinner.component";

export interface JoinMemoryDialogData {
  token: string;
  memory?: Memory;
}

@Component({
  selector: 'app-join-memory-dialog',
  templateUrl: './join-memory-dialog.component.html',
  styleUrls: ['./join-memory-dialog.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
],
})
export class JoinMemoryDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<JoinMemoryDialogComponent>>(MatDialogRef);
  data = inject<JoinMemoryDialogData>(MAT_DIALOG_DATA);
  private memoryService = inject(MemoryService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private auth = inject(Auth);

  memory?: Memory;
  loading = true;
  error?: string;
  joining = false;

  ngOnInit() {
    if (this.data.memory) {
      this.memory = this.data.memory;
      this.loading = false;
    } else {
      this.loadMemoryDetails();
    }
  }

  loadMemoryDetails() {
    this.memoryService.validateShareToken(this.data.token).subscribe({
      next: (response) => {
        if (response.valid && response.memory) {
          this.memory = response.memory;

          // Check if user is already a member
          if (response.alreadyMember) {
            this.snackBar.open('You are already a member of this memory!', 'OK', {
              duration: 4000
            });
            this.dialogRef.close({ alreadyMember: true, memory: this.memory });
            setTimeout(() => {
              this.router.navigate(['/memory', this.memory!.memory_id], {
                state: { fromInvite: true }
              });
            }, 500);
          }
        } else {
          this.error = 'This share link is invalid or has expired.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error validating token:', err);
        this.error = 'Failed to load memory details. Please try again.';
        this.loading = false;
      }
    });
  }

  onJoin() {
    if (!this.memory || !this.auth.currentUser) {
      return;
    }

    this.joining = true;
    const userId = this.auth.currentUser.uid;

    this.memoryService.joinMemoryViaToken(this.data.token, userId).subscribe({
      next: (response) => {
        if (response.alreadyMember) {
          this.snackBar.open('You are already a member of this memory!', 'OK', {
            duration: 4000
          });
        } else {
          this.snackBar.open('Successfully joined the memory!', 'Great!', {
            duration: 3000
          });
        }

        this.dialogRef.close({
          joined: !response.alreadyMember,
          alreadyMember: response.alreadyMember,
          memory: this.memory
        });

        // Navigate to the memory
        setTimeout(() => {
          this.router.navigate(['/memory', this.memory!.memory_id], {
            state: { fromInvite: true }
          });
        }, 500);
      },
      error: (err) => {
        console.error('Error joining memory:', err);
        this.snackBar.open('Failed to join memory. Please try again.', 'Close', {
          duration: 4000
        });
        this.joining = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  formatDate(date: string, endDate: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    const from = new Date(date).toLocaleDateString('en-US', options);
    const to = new Date(endDate).toLocaleDateString('en-US', options);
    return from === to ? from : `${from} - ${to}`;
  }
}