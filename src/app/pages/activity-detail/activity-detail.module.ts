import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ActivityDetailComponent } from './activity-detail.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { MapSnippetComponent } from "../../components/map-snippet/map-snippet.component";

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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    GoogleMapsModule,
    BackButtonComponent,
    MapSnippetComponent
]
})
export class ActivityModule { }