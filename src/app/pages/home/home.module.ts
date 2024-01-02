import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { LogoutButtonComponent } from '../../components/logout-button/logout-button.component';
import { UserInformationComponent } from '../../components/user-information/user-information.component';
import { MatCardModule } from '@angular/material/card';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
]

@NgModule({
  declarations: [
    HomeComponent,
    LogoutButtonComponent,
    UserInformationComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
  ]
})
export class HomeModule { }