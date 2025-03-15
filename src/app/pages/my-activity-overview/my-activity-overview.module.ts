import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MyActivityOverviewComponent } from './my-activity-overview.component';
import { BackButtonModule } from "../../components/back-button/back-button.module";

const routes: Routes = [
  {
    path: '',
    component: MyActivityOverviewComponent
  }
]

@NgModule({
  declarations: [
    MyActivityOverviewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BackButtonModule
]
})
export class ActivitiesOverviewModule { }