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
import { OpenlinkComponent } from './openlink.component';

const routes: Routes = [
  {
    path: '',
    component: OpenlinkComponent
  }
]

@NgModule({
  declarations: [
    OpenlinkComponent
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
    MatButtonModule
  ]
})
export class OpenLinkModule { }