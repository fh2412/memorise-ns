import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FriendsComponent } from './friends.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs'; 
import { FriendCardComponent } from '../../components/friend-card/friend-card.component';
import { FriendSearchComponent } from '../../components/friend-search/friend-search.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { UserInformationComponent } from '../../components/user-information/user-information.component';
import { FriendPreviewComponent } from '../../components/friend-preview/friend-preview.component';


const routes: Routes = [
  {
    path: '',
    component: FriendsComponent
  }
]

@NgModule({
  declarations: [
    FriendsComponent,
    FriendCardComponent,
    FriendSearchComponent,
    UserInformationComponent,
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
    MatTabsModule,
    FriendPreviewComponent,
    MatInputModule,
    FormsModule
  ]
})
export class FriendsModule { }