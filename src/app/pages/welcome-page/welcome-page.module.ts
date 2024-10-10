import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WelcomePageComponent } from './welcome-page.component';

const routes: Routes = [
  {
    path: '',
    component: WelcomePageComponent
  }
]

@NgModule({
  declarations: [
    WelcomePageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class WelcomeModule { }