import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeMapViewComponent } from './home-map-view.component';


const routes: Routes = [
  {
    path: '',
    component: HomeMapViewComponent
  }
]

@NgModule({
  declarations: [
    HomeMapViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  providers: [DatePipe],
})
export class HomeMapViewModule { }