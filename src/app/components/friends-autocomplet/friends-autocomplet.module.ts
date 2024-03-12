import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsAutocompletComponent } from './friends-autocomplet.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [FriendsAutocompletComponent],
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
  exports: [FriendsAutocompletComponent]
})
export class FriendsAutocompleteModule {}
