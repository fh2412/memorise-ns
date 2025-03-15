import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MyActivityOverviewComponent } from './my-activity-overview.component';
import { BackButtonModule } from "../../components/back-button/back-button.module";
import { ActivityCardComponent } from '../../components/activity-card/activity-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    BackButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    ActivityCardComponent
]
})
export class ActivitiesOverviewModule { }