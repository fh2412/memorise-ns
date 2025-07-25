import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { StatsComponent } from '../../components/stats/stats.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MemoryCardComponent } from '../../components/memory-card/memory-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { ViewSelectorComponent } from '../../components/view-selecor/view-selector.component';
import { MatSelectModule } from '@angular/material/select';
import { HomeMapViewComponent } from './home-map-view/home-map-view.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PersonHintComponent } from "../../components/person-hint/person-hint.component";


const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
]

@NgModule({
  declarations: [
    HomeComponent,
    MemoryCardComponent,
    ViewSelectorComponent,
    HomeMapViewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatPaginatorModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    GoogleMapsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    StatsComponent,
    PersonHintComponent
],
  providers: [DatePipe, ViewSelectorComponent],
})
export class HomeModule { }