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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { BackButtonComponent } from "@components/back-button/back-button.component";
import { FriendsAutocompletComponent } from '@components/friends-autocomplet/friends-autocomplet.component';
import { ImageUploadComponent } from '@components/image-upload/image-upload.component';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  {
    path: '',
    component: EditmemoryComponent
  }
]

@NgModule({
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
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        FriendsAutocompletComponent,
        ImageUploadComponent,
        MatToolbarModule,
        MatTableModule,
        MatChipsModule,
        BackButtonComponent,
        MatTooltipModule,
        EditmemoryComponent
    ]
})
export class EditMemoryModule { }