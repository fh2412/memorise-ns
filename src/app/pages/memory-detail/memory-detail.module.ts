import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemoryDetailComponent } from './memory-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MapSnippetComponent } from '../../components/map-snippet/map-snippet.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FriendsProfilePicsComponent } from "../../components/friends-profile-pics/friends-profile-pics.component";

const routes: Routes = [
  {
    path: '',
    component: MemoryDetailComponent
  }
]

@NgModule({
  declarations: [
    MemoryDetailComponent,
  ],
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
    BackButtonComponent,
    MatToolbarModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MapSnippetComponent,
    FriendsProfilePicsComponent
]
})
export class MemoryModule { }