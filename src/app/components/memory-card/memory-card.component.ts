// memory-card.component.ts - Update the shareMemory method
import { DatePipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Memory } from '@models/memoryInterface.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MemoryService } from '@services/memory.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
    selector: 'app-memory-card',
    templateUrl: './memory-card.component.html',
    styleUrl: './memory-card.component.scss',
    standalone: false
})
export class MemoryCardComponent {
  private router = inject(Router);
  private datePipe = inject(DatePipe);
  private snackBar = inject(MatSnackBar);
  private memoryService = inject(MemoryService);
  private clipboard = inject(Clipboard);

  @Input() cardData!: Memory;
  titleUrl: string | undefined;
  isGeneratingLink = false;

  addPhotosMemory(event: Event) {
    this.router.navigate(['/editmemory', this.cardData.memory_id, 'addphotos']);
    event.stopPropagation();
  }

  shareMemory(event: Event) {
    event.stopPropagation();
    
    if (this.isGeneratingLink) {
      return;
    }

    this.isGeneratingLink = true;

    this.memoryService.generateShareLink(this.cardData.memory_id).subscribe({
      next: (response) => {
        // Copy the full share link to clipboard
        const success = this.clipboard.copy(response.directLink);
        
        
        if (success) {
          this.snackBar.open('The invite link was copied to your clipboard!', 'Great!', {
            duration: 3000
          });
        } else {
          // Fallback if clipboard API fails
          this.showLinkDialog(response.shareLink);
        }
        
        this.isGeneratingLink = false;
      },
      error: (err) => {
        console.error('Error generating share link:', err);
        this.snackBar.open('Failed to generate share link. Please try again.', 'Close', {
          duration: 4000
        });
        this.isGeneratingLink = false;
      }
    });
  }

  private showLinkDialog(link: string) {
    // Fallback: show the link in a snackbar with longer duration
    const snackBarRef = this.snackBar.open(
      `Share link: ${link}`, 
      'Copy', 
      { duration: 10000 }
    );
    
    snackBarRef.onAction().subscribe(() => {
      this.clipboard.copy(link);
      this.snackBar.open('Link copied!', 'OK', { duration: 2000 });
    });
  }

  formatDate(date: string | undefined, end_date: string | undefined): string {
    if (!date || !end_date) {
      return 'N/A';
    }
   
    const from = this.datePipe.transform(new Date(date), 'dd.MM.yyyy') || 'N/A';
    const to = this.datePipe.transform(new Date(end_date), 'dd.MM.yyyy') || 'N/A';
    return from === to ? from : `${from} - ${to}`;
  }
}