// photo-download.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { PhotoDownloadComponent } from './photo-download.component';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';

const routes: Routes = [
  {
    path: '',
    component: PhotoDownloadComponent
  }
]

@NgModule({
  declarations: [PhotoDownloadComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BackButtonComponent
  ],
})
export class PhotoDownloadModule { }