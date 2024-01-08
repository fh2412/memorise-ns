import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemoryDetailComponent } from './memory-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

const routes: Routes = [
  {
    path: '',
    component: MemoryDetailComponent
  }
]

@NgModule({
  declarations: [
    MemoryDetailComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule
  ]
})
export class MemoryModule { }