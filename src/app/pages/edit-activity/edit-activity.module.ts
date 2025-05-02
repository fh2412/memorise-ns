import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { EditActivityComponent } from './edit-activity.component';

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
    ]
})
export class EditActivityModule { }