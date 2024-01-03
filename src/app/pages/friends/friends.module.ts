import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FriendsComponent } from './friends.component';

const routes: Routes = [
  {
    path: '',
    component: FriendsComponent
  }
]

@NgModule({
  declarations: [
    FriendsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
  ]
})
export class FriendsModule { }