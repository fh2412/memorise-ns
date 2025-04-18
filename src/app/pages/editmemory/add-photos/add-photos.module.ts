import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AddPhotosComponent } from './add-photos.component';
import { ImageUploadModule } from '../../../components/image-upload/image-upload.module';
import { BackButtonModule } from '../../../components/back-button/back-button.module';

const routes: Routes = [
  {
    path: '',
    component: AddPhotosComponent
  }
]

@NgModule({
    declarations: [
      AddPhotosComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ImageUploadModule,
        BackButtonModule
    ]
})
export class AddPhotosModule { }