import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { UserInformationComponent } from '../../components/user-information/user-information.component';
import { MatCardModule } from '@angular/material/card';
import { MomorypreviewComponent } from '../../components/momorypreview/momorypreview.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MemoryCardComponent } from '../../components/memory-card/memory-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { LogoutButtonComponent } from '../../components/logout-button/logout-button.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
]

@NgModule({
  declarations: [
    HomeComponent,
    UserInformationComponent,
    MomorypreviewComponent,
    StatsComponent,
    MemoryCardComponent,
    LogoutButtonComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatPaginatorModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [DatePipe],
})
export class HomeModule { }