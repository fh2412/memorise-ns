import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { UserInformationComponent } from '../../components/user-information/user-information.component';
import { MatCardModule } from '@angular/material/card';
import { MomorypreviewComponent } from '../../components/momorypreview/momorypreview.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MemoryCardComponent } from '../../components/memory-card/memory-card.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
]

@NgModule({
  declarations: [
    HomeComponent,
    UserInformationComponent,
    MomorypreviewComponent,
    StatsComponent,
    MemoryCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatPaginatorModule
  ]
})
export class HomeModule { }