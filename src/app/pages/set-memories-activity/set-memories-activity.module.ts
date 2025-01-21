import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SetMemoriesActivityComponent } from './set-memories-activity.component';
import { BackButtonModule } from "../../components/back-button/back-button.module";
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { QuickActivityAutocompleteModule } from '../../components/quick-activity-autocomplete/quick-activity-autocomplete.module';

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
    BackButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
    FormsModule,
    MatAutocompleteModule,
    QuickActivityAutocompleteModule
],
  providers: [],
})
export class SetMemoriesActivityModule { }