import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { EditActivityComponent } from './edit-activity.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MemorySelectorComponent } from "../../components/memory-selecter/memory-selecter.component";
import { ActivityFormComponent } from "../../components/activity-form/activity-form.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
    {
        path: '',
        component: EditActivityComponent
    }
]

@NgModule({
    declarations: [
        EditActivityComponent
    ],
    imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    BackButtonComponent,
    MatCardModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSliderModule,
    ReactiveFormsModule,
    MatListModule,
    MatButtonToggleModule,
    MemorySelectorComponent,
    ActivityFormComponent,
    MatProgressSpinnerModule
]
})
export class EditActivityModule { }