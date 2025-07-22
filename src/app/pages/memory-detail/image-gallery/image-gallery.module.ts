import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
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
import { ImageGalleryComponent } from './image-gallery.component';
import { BackButtonComponent } from "../../../components/back-button/back-button.component";
import { PersonHintComponent } from "../../../components/person-hint/person-hint.component";

const routes: Routes = [
  {
    path: '',
    component: ImageGalleryComponent
  }
]

@NgModule({
  declarations: [
    ImageGalleryComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    MatGridListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    GoogleMapsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatToolbarModule,
    MatTableModule,
    BackButtonComponent,
    NgOptimizedImage,
    PersonHintComponent
]
})
export class ImageGalleryModule { }