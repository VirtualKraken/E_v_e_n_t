import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 1. Import the Guard functions
import {
  canActivate,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from '@angular/fire/auth-guard';

import { HomeComponent } from './pages/home/home.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { LoginComponent } from './pages/login/login.component';
import { VendorListComponent } from './pages/vendor-list/vendor-list.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ProductionChecklistComponent } from './pages/production-checklist/production-checklist.component';
import { AnonChecklistGuard } from './guards/anon-checklist.guard';
import { AdminOnlyGuard } from './guards/admin-only.guard';

// 2. Define the Rules
// "If not logged in, go to Login"
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

// "If already logged in, go to Home" (So they don't see the login screen again)
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    // If they are already logged in, skip this page and go to Home
    ...canActivate(redirectLoggedInToHome),
  },
  {
    path: 'home',
    component: HomeComponent,
    // Protect this route: Check if logged in
    canActivate: [AdminOnlyGuard],
  },
  {
    path: 'event-details/:id',
    component: EventDetailsComponent,
    canActivate: [AdminOnlyGuard],
  },

  // 2. Route WITHOUT an ID (e.g. /event-details)
  {
    path: 'event-details',
    component: EventDetailsComponent,
    canActivate: [AdminOnlyGuard],
  },

  {
    path: 'vendor-list',
    component: VendorListComponent,
    canActivate: [AdminOnlyGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AdminOnlyGuard],
  },
  {
    path: 'production-checklist/:id',
    component: ProductionChecklistComponent,
    canActivate: [AnonChecklistGuard],
    data: { mode: 'production' }
  },

  // Default Routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
