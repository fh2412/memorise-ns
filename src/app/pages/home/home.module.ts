import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { UserInformationComponent } from '../../components/user-information/user-information.component';
import { MatCardModule } from '@angular/material/card';
import { MomorypreviewComponent } from '../../components/momorypreview/momorypreview.component';

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
    MomorypreviewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
  ]
})
export class HomeModule { }