import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { RouterModule } from '@angular/router';
import { EvolveTopNavComponent } from './components/evolve-top-nav/evolve-top-nav.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HomeComponent } from './pages/home/home.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { EventInfoComponent } from './hoc/event-info/event-info.component';
import { EventCrewComponent } from './hoc/event-crew/event-crew.component';
import { EventAssetsComponent } from './hoc/event-assets/event-assets.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatMenuModule} from '@angular/material/menu';
import { EvolveSideNavContentComponent } from './components/evolve-side-nav-content/evolve-side-nav-content.component';
import { LoginComponent } from './pages/login/login.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { EventQuoteComponent } from './hoc/event-quote/event-quote.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EvolveTopNavComponent,
    EventDetailsComponent,
    EventInfoComponent,
    EventCrewComponent,
    EventAssetsComponent,
    EvolveSideNavContentComponent,
    LoginComponent,
    EventQuoteComponent
    // other components go here
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    AppRoutingModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatDatepickerModule,
    MatTabsModule,
    MatSelectModule,
    MatDialogModule,
    MatCardModule,
    FormsModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    MatSlideToggleModule
  ],
  bootstrap: [AppComponent],
  providers:[ provideNativeDateAdapter()]
})
export class AppModule {}
