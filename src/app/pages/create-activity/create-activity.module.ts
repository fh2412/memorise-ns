import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatStepperModule} from '@angular/material/stepper'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackButtonModule } from '../../components/back-button/back-button.module';
import { CreateActivityComponent } from './create-activity.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider'; 

const routes: Routes = [
  {
    path: '',
    component: CreateActivityComponent
  }
]

@NgModule({
  declarations: [
    CreateActivityComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    ReactiveFormsModule,
    FormsModule,
    BackButtonModule,
    MatSlideToggleModule,
    MatSliderModule
  ]
})
export class CreateActivityModule {}