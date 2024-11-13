import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { UserResolver } from './models/user-resolver';
import { ProfileResolver } from './models/profile-resolver';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    canActivate: [authGuard]
  },
  {
    path: 'memory/:id',
    loadChildren: () => import('./pages/memory-detail/memory-detail.module').then(m => m.MemoryModule),
    canActivate: [authGuard]
  },
  {
    path: 'memory/:id/gallery',
    loadChildren: () => import('./pages/memory-detail/image-gallery/image-gallery.module').then(m => m.ImageGalleryModule),
    canActivate: [authGuard]
  },
  {
    path: 'editmemory/:id',
    loadChildren: () => import('./pages/editmemory/editmemory.module').then(m => m.EditMemoryModule),
    canActivate: [authGuard]
  },
  {
    path: 'editmemory/:id/addphotos',
    loadChildren: () => import('./pages/editmemory/add-photos/add-photos.module').then(m => m.AddPhotosModule),
    canActivate: [authGuard]
  },
  {
    path: 'editmemory/managephotos/:imageUrl',
    loadChildren: () => import('./pages/editmemory/manage-photos/manage-photos.module').then(m => m.ManagePhotosModule),
    canActivate: [authGuard]
  },
  {
    path: 'newmemory',
    loadChildren: () => import('./pages/adding-memory/adding-memory.module').then(m => m.AddingMemoryModule),
    canActivate: [authGuard]
  },
  {
    path: 'friends',
    loadChildren: () => import('./pages/friends/friends.module').then(m => m.FriendsModule),
    canActivate: [authGuard]
  },
  { 
    path: 'invite/:userId', 
    loadChildren: () => import('./pages/other-userprofile/other-userprofile.module').then(m => m.OtherUserProfileModule),
    canActivate: [authGuard],
    resolve: { user: ProfileResolver }
  },
  { 
    path: 'userprofile/:userId', 
    loadChildren: () => import('./pages/userprofile/userprofile.module').then(m => m.UserProfileModule),
    canActivate: [authGuard],
    resolve: { user: UserResolver }
  },
  { 
    path: 'user/:userId', 
    loadChildren: () => import('./pages/other-userprofile/other-userprofile.module').then(m => m.OtherUserProfileModule),
    canActivate: [authGuard],
    resolve: { user: ProfileResolver }
  },
  {
    path: 'activities',
    loadChildren: () => import('./pages/activities/activites.module').then(m => m.ActivitiesModule),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
