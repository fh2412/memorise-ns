import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { UserInformationComponent } from '../../components/user-information/user-information.component';
import { MatCardModule } from '@angular/material/card';
import { MomorypreviewComponent } from '../../components/momorypreview/momorypreview.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    StatsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule
  ]
})
export class HomeModule { }