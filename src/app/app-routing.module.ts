import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';

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
    path: 'activities',
    loadChildren: () => import('./pages/activities/activites.module').then(m => m.ActivitiesModule),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
