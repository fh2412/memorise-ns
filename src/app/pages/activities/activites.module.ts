import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ActivitiesComponent } from './activities.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';
import { FilterbarComponent } from '../../components/filterbar/filterbar.component';
import {MatCheckboxModule} from '@angular/material/checkbox'; 

const routes: Routes = [
  {
    path: '',
    component: ActivitiesComponent
  }
]

@NgModule({
  declarations: [
    ActivitiesComponent,
    ChooseLocationComponent,
    FilterbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    GoogleMapsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class ActivitiesModule { }