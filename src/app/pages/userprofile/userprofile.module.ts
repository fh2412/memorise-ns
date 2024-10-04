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
import { UserProfileComponent } from './userprofile.component';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { LogoutButtonComponent } from '../../components/logout-button/logout-button.component';
import { EditUserDialogComponent } from '../../components/_dialogs/edit-user-dialog/edit-user-dialog.component';
import { MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PinCardComponent } from '../../components/pin-card/pin-card.component';

const routes: Routes = [
  {
    path: '',
    component: UserProfileComponent
  }
]

@NgModule({
  declarations: [
    UserProfileComponent,
    LogoutButtonComponent,
    EditUserDialogComponent,
    PinCardComponent
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
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,

    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [DatePipe], // Add DatePipe here if needed
})
export class UserProfileModule { }