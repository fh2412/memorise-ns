import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EditmemoryComponent } from './editmemory.component';

const routes: Routes = [
  {
    path: '',
    component: EditmemoryComponent
  }
]

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class EditMemoryModule { }