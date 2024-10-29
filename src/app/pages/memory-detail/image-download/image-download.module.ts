import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table'; 
import { BackButtonModule } from "../../../components/back-button/back-button.module";
import { ImageDownloadComponent } from './image-download.component';

const routes: Routes = [
  {
    path: '',
    component: ImageDownloadComponent
  }
]

@NgModule({
  declarations: [
    ImageDownloadComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BackButtonModule
]
})
export class ImageDownloadModule { }