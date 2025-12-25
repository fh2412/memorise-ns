import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ManagePhotosComponent } from './manage-photos.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BackButtonComponent } from "@components/back-button/back-button.component";
import { ImageUploadComponent } from '@components/image-upload/image-upload.component';

const routes: Routes = [
  {
    path: '',
    component: ManagePhotosComponent
  }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ImageUploadComponent,
        MatGridListModule,
        MatIconModule,
        MatButtonModule,
        BackButtonComponent,
        ManagePhotosComponent
    ]
})
export class ManagePhotosModule { }