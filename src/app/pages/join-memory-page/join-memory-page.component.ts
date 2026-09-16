import { Component, OnInit, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, Router } from "@angular/router";
import { JoinMemoryDialogComponent } from "@components/_dialogs/join-memory-dialog/join-memory-dialog.component";
import { MemoryService } from "@services/memory.service";

@Component({
  standalone: true,
  selector: 'app-join-memory-page',
  templateUrl: './join-memory-page.component.html',
  styleUrl: './join-memory-page.component.scss',
  imports: [MatProgressSpinnerModule]
})
export class JoinMemoryPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private memoryService = inject(MemoryService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.router.navigate(['/']);
      return;
    }

    this.memoryService.validateShareToken(token).subscribe({
      next: (res) => {
        if (!res.valid) {
          this.router.navigate(['/']);
          return;
        }

        console.log("Result: ", res);

        const targetRoute = res.isPast ? `/memory/${res.memoryId}` : `/plans/trip-workspace/${res.memoryId}`;

        // CASE 1: User is already a member
        if (res.alreadyMember) {
          // TODO: SHOW YOUR SNACKBAR COMPONENT HERE
          // e.g., this.snackBar.openFromComponent(MyCustomSnackbarComponent, { data: 'You are already in this crew!' });
          this.router.navigateByUrl(targetRoute);
          return;
        }

        // CASE 2: User is logged in & not a member -> Open Dialog
        this.openJoinDialog(token, res.title, res.placeholders, targetRoute);
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private openJoinDialog(token: string, tripTitle: string, placeholders: any[], targetRoute: string): void {
    const dialogRef = this.dialog.open(JoinMemoryDialogComponent, {
      width: '480px',
      disableClose: true,
      data: { tripTitle, placeholders }
    });

    dialogRef.afterClosed().subscribe((selectedPlaceholderId: string | null | undefined) => {
      if (selectedPlaceholderId !== undefined) {
        // User confirmed join (either picked a placeholder ID or null for fresh user)
        this.memoryService.joinMemoryViaToken(token, selectedPlaceholderId).subscribe({
          next: () => this.router.navigateByUrl(targetRoute),
          error: (err) => console.error('Failed to join memory:', err)
        });
      } else {
        // User cancelled dialog
        this.router.navigate(['/']);
      }
    });
  }
}