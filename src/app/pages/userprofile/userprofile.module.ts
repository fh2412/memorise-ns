import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {  MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { UserProfileComponent } from './userprofile.component';
import { MatListModule } from '@angular/material/list';
import { LogoutButtonComponent } from '@components/logout-button/logout-button.component';
import { EditUserDialogComponent } from '@components/_dialogs/edit-user-dialog/edit-user-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackButtonComponent } from "@components/back-button/back-button.component";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PinCardComponent } from '@components/pin-card/pin-card.component';
import { VisitedCountryMapComponent } from "@components/visited-country-map/visited-country-map.component";
import { MatTabGroup, MatTabsModule } from "@angular/material/tabs";

const routes: Routes = [
  {
    path: '',
    component: UserProfileComponent
  }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatFormFieldModule,
        MatGridListModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        MatListModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        BackButtonComponent,
        PinCardComponent,
        MatAutocompleteModule,
        LogoutButtonComponent,
        VisitedCountryMapComponent,
        MatTabGroup,
        MatTabsModule,
        UserProfileComponent,
        EditUserDialogComponent
    ],
    providers: [DatePipe], // Add DatePipe here if needed
})
export class UserProfileModule { }