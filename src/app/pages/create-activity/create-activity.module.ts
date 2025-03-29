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
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { CreateActivityComponent } from './create-activity.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import { MapSnippetComponent } from "../../components/map-snippet/map-snippet.component";
import {MatButtonToggleModule} from '@angular/material/button-toggle'; 
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    BackButtonComponent,
    MatSlideToggleModule,
    MatSliderModule,
    BackButtonComponent,
    MapSnippetComponent,
    MatButtonToggleModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule
]
})
export class CreateActivityModule {}