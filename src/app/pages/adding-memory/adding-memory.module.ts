import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AddingMemoryComponent } from './adding-memory.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker'; 
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatStepperModule} from '@angular/material/stepper'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import {MatProgressBarModule} from '@angular/material/progress-bar'; 
import { MatListModule } from '@angular/material/list';
import { MemoryAddFriendDialogComponent } from '../../components/_dialogs/memory-add-friend-dialog/memory-add-friend-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatChipsModule} from '@angular/material/chips';
import { FriendsAutocompletComponent } from '../../components/friends-autocomplet/friends-autocomplet.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatSlideToggleModule} from '@angular/material/slide-toggle'; 
import { MatGridListModule } from '@angular/material/grid-list';

const routes: Routes = [
  {
    path: '',
    component: AddingMemoryComponent
  }
]

@NgModule({
  declarations: [
    AddingMemoryComponent,
    ImageUploadComponent,
    MemoryAddFriendDialogComponent,
    FriendsAutocompletComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatListModule,
    MatDialogModule,
    FormsModule,
    MatChipsModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatSlideToggleModule,
    MatGridListModule
  ]
})
export class AddingMemoryModule {}