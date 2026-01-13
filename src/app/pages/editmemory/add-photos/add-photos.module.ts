import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AddPhotosComponent } from './add-photos.component';
import { BackButtonComponent } from '@components/back-button/back-button.component';
import { ImageUploadComponent } from '@components/image-upload/image-upload.component';

const routes: Routes = [
  {
    path: '',
    component: AddPhotosComponent
  }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ImageUploadComponent,
        BackButtonComponent,
        AddPhotosComponent
    ]
})
export class AddPhotosModule { }