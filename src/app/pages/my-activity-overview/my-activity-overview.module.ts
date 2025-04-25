import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MyActivityOverviewComponent } from './my-activity-overview.component';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { ActivityCardComponent } from '../../components/activity-card/activity-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivityListComponent } from "../../components/activity-list/activity-list.component";

const routes: Routes = [
  {
    path: '',
    component: MyActivityOverviewComponent
  }
]

@NgModule({
  declarations: [
    MyActivityOverviewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BackButtonComponent,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    ActivityCardComponent,
    ActivityListComponent
]
})
export class ActivitiesOverviewModule { }