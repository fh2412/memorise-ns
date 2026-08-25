import { Component, inject, signal, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CrewMember, CrewSelectorComponent } from "@components/crew-selector/crew-selector.component";

@Component({
  selector: 'app-add-crew-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CrewSelectorComponent
],
  template: `
    <h2 mat-dialog-title>Manage Trip Crew</h2>
    <mat-dialog-content class="custom-dialog-content">
      <!-- 
        We pass a local editable copy of the crew to the selector 
        so we don't mutate the parent's state before the user hits "Save".
      -->
      <app-crew-selector [(crew)]="editableCrew" />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Save Crew</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .custom-dialog-content {
      min-width: 500px; /* Gives the selector enough room to look good */
      min-height: 450px;
      padding-top: 8px !important;
    }
  `]
})
export class AddCrewDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<AddCrewDialogComponent>);
  data: { currentCrew: CrewMember[] } = inject(MAT_DIALOG_DATA);

  // Signal for the dialog's temporary state
  editableCrew = signal<CrewMember[]>([]);

  ngOnInit() {
    // Clone the passed crew array so we don't mutate the original by reference
    this.editableCrew.set([...this.data.currentCrew]);
  }

  save() {
    // Close the dialog and pass the updated array back to the parent
    this.dialogRef.close(this.editableCrew());
  }
}