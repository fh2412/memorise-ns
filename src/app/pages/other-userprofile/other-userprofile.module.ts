import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {  MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { LogoutButtonComponent } from '../../components/logout-button/logout-button.component';
import { EditUserDialogComponent } from '../../components/_dialogs/edit-user-dialog/edit-user-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PinCardComponent } from '../../components/pin-card/pin-card.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackButtonModule } from "../../components/back-button/back-button.module";
import { OtherUserprofileComponent } from './other-userprofile.component';
import { PinCardModule } from '../../components/pin-card/pin-card.module';

const routes: Routes = [
  {
    path: '',
    component: OtherUserprofileComponent
  }
]

@NgModule({
  declarations: [
    OtherUserprofileComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatGridListModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    BackButtonModule,
    PinCardModule
],
  providers: [DatePipe], // Add DatePipe here if needed
})
export class OtherUserProfileModule { }