import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EditmemoryComponent } from './editmemory.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FriendsAutocompleteModule } from '../../components/friends-autocomplet/friends-autocomplet.module';
import { ImageUploadModule } from '../../components/image-upload/image-upload.module';
import { MatToolbarModule } from '@angular/material/toolbar';

const routes: Routes = [
  {
    path: '',
    component: EditmemoryComponent
  }
]

@NgModule({
    declarations: [
        EditmemoryComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatFormFieldModule,
        MatGridListModule,
        MatDatepickerModule,
        MatNativeDateModule,
        GoogleMapsModule,
        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        FriendsAutocompleteModule,
        ImageUploadModule,
        MatToolbarModule
    ]
})
export class EditMemoryModule { }