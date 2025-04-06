import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ActivityDetailComponent } from './activity-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ActivityDetailComponent
  }
]

@NgModule({
  declarations: [
    ActivityDetailComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ]
})
export class ActivityModule { }