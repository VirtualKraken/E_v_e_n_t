import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NgModule } from '@angular/core';
import { EventDetailsComponent } from './pages/event-details/event-details.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'event-details',
    component: EventDetailsComponent,
  },
  { path: '**', redirectTo: 'home' },

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
