import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuickActivityAutocompleteComponent } from './quick-activity-autocomplete.component';

@NgModule({
  declarations: [QuickActivityAutocompleteComponent],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    FormsModule,
    MatChipsModule,
],
  exports: [QuickActivityAutocompleteComponent]
})
export class QuickActivityAutocompleteModule {}
