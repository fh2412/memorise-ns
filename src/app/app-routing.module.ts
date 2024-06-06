import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { UserResolver } from './models/user-resolver';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'beta-landingpage',
    loadChildren: () => import('./pages/beta-landingpage/beta-landingpage.module').then(m => m.BetaLandingpageModule),
  },
  {
    path: 'thank-you',
    loadChildren: () => import('./pages/thank-you/thank-you.module').then(m => m.ThankYouModule),
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
    loadChildren: () => import('./pages/openlink/openlink.module').then(m => m.OpenLinkModule),
    canActivate: [authGuard],
    resolve: { user: UserResolver }
  },
  { 
    path: 'userprofile/:userId', 
    loadChildren: () => import('./pages/openlink/openlink.module').then(m => m.OpenLinkModule),
    canActivate: [authGuard],
    resolve: { user: UserResolver }
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
