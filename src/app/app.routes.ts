import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NgModule } from '@angular/core';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'event-details/:id',
    component: EventDetailsComponent,
  },
  { path: '**', redirectTo: 'login' },

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
