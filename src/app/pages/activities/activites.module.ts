import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ActivitiesComponent } from './activities.component';

const routes: Routes = [
  {
    path: '',
    component: ActivitiesComponent
  }
]

@NgModule({
  declarations: [
    ActivitiesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
  ]
})
export class ActivitiesModule { }