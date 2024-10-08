import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule} from '@angular/fire/compat';
import { AngularFireAuthModule} from '@angular/fire/compat/auth';
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment.development';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MainNavComponent } from './components/mainnav/mainnav.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select'; 
import { ChangePasswordDialogComponent } from './components/_dialogs/change-password-dialog/change-password-dialog.component';
import { UploadProgressDialogComponent } from './components/_dialogs/upload-progress-dialog/upload-progress-dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageDialogComponent } from './components/_dialogs/image-dialog/image-dialog.component';
import { FriendsPreviewModule } from './components/friend-preview/friend-preview.module';
import { DateAdapter, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { InfoDialogComponent } from './components/_dialogs/info-dialog/info-dialog.component';
import { ConfirmDialogComponent } from './components/_dialogs/confirm-dialog/confirm-dialog.component';
import { LinkModalComponent } from './components/_dialogs/link-modal/link-modal.component';
import { PinnedDialogComponent } from './components/_dialogs/pinned-dialog/pinned-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CompanyDialogComponent } from './components/_dialogs/company-dialog/company-dialog.component';
import { FullDescriptionDialogComponent } from './components/_dialogs/full-description-dialog/full-description-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    ChangePasswordDialogComponent,
    UploadProgressDialogComponent,
    ImageDialogComponent,
    InfoDialogComponent,
    ConfirmDialogComponent,
    LinkModalComponent,
    PinnedDialogComponent,
    CompanyDialogComponent,
    FullDescriptionDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    HttpClientModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatProgressBarModule,
    GoogleMapsModule,
    FriendsPreviewModule,
    MatCheckboxModule
  ],
  providers: [ provideNativeDateAdapter(), { provide: DateAdapter, useClass: MatNativeDateModule },],
  bootstrap: [AppComponent]
})
export class AppModule { }
