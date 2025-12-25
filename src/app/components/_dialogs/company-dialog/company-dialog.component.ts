import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

export interface CompanyData {
  name: string;
  phone: string;
  email: string;
  website: string;
}

@Component({
    selector: 'app-company-dialog',
    templateUrl: './company-dialog.component.html',
    styleUrls: ['./company-dialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDialogActions, MatButton]
})
export class CompanyDialogComponent {
  dialogRef = inject<MatDialogRef<CompanyDialogComponent>>(MatDialogRef);
  data = inject<CompanyData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  companyForm: FormGroup;

  constructor() {
    const data = this.data;

    this.companyForm = this.fb.group({
      name: [data.name, Validators.required],
      phone: [data.phone, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      website: [data.website, Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.companyForm.valid) {
      this.dialogRef.close(this.companyForm.value);
    }
  }
}
