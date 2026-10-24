import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { UserResolver } from './models/user-resolver';
import { ProfileResolver } from './models/profile-resolver';
//import { ActivityOwnerGuard } from './guards/activity-owner.guard';
import { MemoryEditorGuard } from './guards/memory-editor.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'memory/join/:token',
    loadComponent: () => import('./pages/join-memory-page/join-memory-page.component')
      .then(m => m.JoinMemoryPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'memory/:id',
    loadComponent: () => import('./pages/memory-detail/memory-detail.component').then(m => m.MemoryDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'memory/:id/gallery',
    loadComponent: () => import('./pages/memory-detail/image-gallery/image-gallery.component').then(m => m.ImageGalleryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'memory/:id/download',
    loadComponent: () => import('./pages/memory-detail/photo-download/photo-download.component').then(m => m.PhotoDownloadComponent),
    canActivate: [authGuard]
  },
  {
    path: 'editmemory/:id',
    loadComponent: () => import('./pages/editmemory/editmemory.component').then(m => m.EditmemoryComponent),
    canActivate: [authGuard, MemoryEditorGuard]
  },
  {
    path: 'editmemory/:id/addphotos',
    loadComponent: () => import('./pages/editmemory/add-photos/add-photos.component').then(m => m.AddPhotosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'editmemory/managephotos/:memoryId',
    loadComponent: () => import('./pages/editmemory/manage-photos/manage-photos.component').then(m => m.ManagePhotosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'newmemory',
    loadComponent: () => import('./pages/create-memory/create-memory.component').then(m => m.CreateMemoryComponent),
    canActivate: [authGuard]
  },
  /*{
    path: 'setactivity',
    loadChildren: () => import('./pages/set-memories-activity/set-memories-activity.module').then(m => m.SetMemoriesActivityModule),
    canActivate: [authGuard]
  },*/
  {
    path: 'friends',
    loadComponent: () => import('./pages/friends/friends.component').then(m => m.FriendsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'invite/:userId', 
    loadComponent: () => import('./pages/other-userprofile/other-userprofile.component').then(m => m.OtherUserprofileComponent),
    canActivate: [authGuard],
    resolve: { user: ProfileResolver }
  },
  { 
    path: 'userprofile/:userId', 
    loadComponent: () => import('./pages/userprofile/userprofile.component').then(m => m.UserProfileComponent),
    canActivate: [authGuard],
    resolve: { user: UserResolver }
  },
  { 
    path: 'user/:userId', 
    loadComponent: () => import('./pages/other-userprofile/other-userprofile.component').then(m => m.OtherUserprofileComponent),
    canActivate: [authGuard],
    resolve: { user: ProfileResolver }
  },
  {
    path: 'plans',
    loadComponent: () => import('./pages/plans/plans.component').then(m => m.PlansComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plans/start/crew',
    loadComponent: () => import('./pages/plans/plan-crew/plan-crew.component').then(m => m.PlanCrewComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plans/trip-workspace/:memoryId',
    loadComponent: () => import('./pages/trip-workspace/trip-workspace.component').then(m => m.TripWorkspaceComponent),
    canActivate: [authGuard]
  },
  /*{
    path: 'activities',
    loadChildren: () => import('./pages/activities/activites.module').then(m => m.ActivitiesModule),
    canActivate: [authGuard]
  },
  {
    path: 'activity/details/:id',
    loadChildren: () => import('./pages/activity-detail/activity-detail.module').then(m => m.ActivityModule),
    canActivate: [authGuard]
  },
  {
    path: 'activity/overview/:userId',
    loadChildren: () => import('./pages/my-activity-overview/my-activity-overview.module').then(m => m.ActivitiesOverviewModule),
    canActivate: [authGuard]
  },
  {
    path: 'activity/create',
    loadChildren: () => import('./pages/create-activity/create-activity.module').then(m => m.CreateActivityModule),
    canActivate: [authGuard]
  },
  {
    path: 'activity/edit/:id',
    loadChildren: () => import('./pages/edit-activity/edit-activity.module').then(m => m.EditActivityModule),
    canActivate: [authGuard, ActivityOwnerGuard]
  },*/
  {
    path: 'error/:errorId',
    loadComponent: () => import('./pages/navigation-error/navigation-error.component').then(m => m.NavigationErrorComponent)
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
