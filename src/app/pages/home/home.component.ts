import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../service/firebase.service';
import { EvolveEvent } from '../../types/quotes';
import { AuthService } from '../../../service/auth.service';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { filter } from 'rxjs/operators';

// Interface for UI grouping
interface EventGroup {
  month: string; // e.g. "December 2025"
  events: EvolveEvent[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
})
export class HomeComponent implements OnInit {
  groupedEvents: EventGroup[] = [];
  loading = true;

  // Store event dates for calendar highlighting
  eventDates: Set<string> = new Set();
  $authSub: any;
  $eventSub: any;
  user: any;
  dashboardStats = {
    total: 0,
    upcoming: 0,
    completed: 0,
    conversion: 0,
  };
  lastVisibleDoc: any = null;
  hasMore = true;
  pageSize = 10;
  allEvents: EvolveEvent[] = [];
  readonly nowISO = new Date().toISOString();
  constructor(
    private router: Router,
    private fs: FirebaseService,
    public authservice: AuthService
  ) {}

  ngOnInit(): void {
    this.$authSub = this.authservice.user$
      .pipe(filter((user) => !!user))
      .subscribe(async (user) => {
        this.user = user;
        this.allEvents = []; // Store raw list to re-group easily
        await this.loadMoreEvents();
        await this.loadDashboardStats();
      });
  }

  async loadDashboardStats() {
    try {
      this.dashboardStats = await this.fs.getDashboardStats(30);
      console.log(this.dashboardStats);

    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    }
  }

  async loadMoreEvents() {
    if (!this.hasMore) return;

    this.loading = true;
    try {
      const result = await this.fs.getEventsPaged(
        this.pageSize,
        this.lastVisibleDoc
      );

      if (result.events.length < this.pageSize) {
        this.hasMore = false;
      }

      // Append new events to the master list
      this.allEvents = [...this.allEvents, ...result.events];

      // Group the cumulative list
      this.groupedEvents = this.groupEventsByMonth(this.allEvents);
      this.extractEventDates(this.allEvents);

      this.lastVisibleDoc = result.lastVisible;
    } catch (err) {
      console.error('Error loading events', err);
    } finally {
      this.loading = false;
    }
  }

  openEventDetails(evolveEvent?: EvolveEvent) {
    if (evolveEvent) {
      // Edit Mode
      this.router.navigate(['/event-details', evolveEvent.id]);
    } else {
      // Create Mode
      this.router.navigate(['/event-details']);
    }
  }

  // Extract dates that have events for calendar highlighting
  private extractEventDates(events: EvolveEvent[]): void {
    this.eventDates.clear();
    events.forEach((event) => {
      const date = new Date(event.event_info.function_date);
      const dateString = date.toISOString().split('T')[0];
      this.eventDates.add(dateString);
    });
  }

  // Calendar date highlight logic
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      const dateString = cellDate.toISOString().split('T')[0];
      return this.eventDates.has(dateString) ? 'has-event' : '';
    }
    return '';
  };

  // Group events by Month
  private groupEventsByMonth(events: EvolveEvent[]): EventGroup[] {
    const sortedEvents = [...events].sort(
      (a, b) =>
        new Date(b.event_info.function_date).getTime() -
        new Date(a.event_info.function_date).getTime()
    );

    const groups: { [key: string]: EvolveEvent[] } = {};

    sortedEvents.forEach((event) => {
      const date = new Date(event.event_info.function_date);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });

    return Object.keys(groups).map((key) => ({
      month: key,
      events: groups[key],
    }));
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.$authSub?.unsubscribe();
    this.$eventSub?.unsubscribe();
  }
}
