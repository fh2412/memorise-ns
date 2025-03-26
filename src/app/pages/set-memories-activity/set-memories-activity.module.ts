import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SetMemoriesActivityComponent } from './set-memories-activity.component';
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { QuickActivityAutocompleteComponent } from '../../components/quick-activity-autocomplete/quick-activity-autocomplete.component';

const routes: Routes = [
  {
    path: '',
    component: SetMemoriesActivityComponent
  }
]

@NgModule({
  declarations: [
    SetMemoriesActivityComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BackButtonComponent,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
    FormsModule,
    MatAutocompleteModule,
    QuickActivityAutocompleteComponent
],
  providers: [],
})
export class SetMemoriesActivityModule { }