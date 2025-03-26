import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {  MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { OtherUserprofileComponent } from './other-userprofile.component';
import { PinCardModule } from '../../components/pin-card/pin-card.module';

const routes: Routes = [
  {
    path: '',
    component: OtherUserprofileComponent
  }
]

@NgModule({
  declarations: [
    OtherUserprofileComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatGridListModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    BackButtonComponent,
    PinCardModule
],
  providers: [DatePipe], // Add DatePipe here if needed
})
export class OtherUserProfileModule { }