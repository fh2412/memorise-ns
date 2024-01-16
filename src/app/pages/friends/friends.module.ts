import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FriendsComponent } from './friends.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FriendPreviewComponent } from '../../components/friend-preview/friend-preview.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs'; 

const routes: Routes = [
  {
    path: '',
    component: FriendsComponent
  }
]

@NgModule({
  declarations: [
    FriendsComponent,
    FriendPreviewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatTabsModule
  ]
})
export class FriendsModule { }