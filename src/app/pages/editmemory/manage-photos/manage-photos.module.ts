import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ImageUploadModule } from '../../../components/image-upload/image-upload.module';
import { ManagePhotosComponent } from './manage-photos.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: '',
    component: ManagePhotosComponent
  }
]

@NgModule({
    declarations: [
      ManagePhotosComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ImageUploadModule,
        MatGridListModule,
        MatIconModule
    ]
})
export class ManagePhotosModule { }