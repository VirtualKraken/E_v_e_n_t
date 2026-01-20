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
  allEvents: EvolveEvent[] = [];
  readonly nowISO = new Date().toISOString();
  displayingYear = new Date().getFullYear();

  constructor(
    private router: Router,
    private fs: FirebaseService,
    public authservice: AuthService,
  ) {}

  ngOnInit(): void {
    this.$authSub = this.authservice.user$
      .pipe(filter((user) => !!user))
      .subscribe(async (user) => {
        this.user = user;
        this.allEvents = []; // Store raw list to re-group easily
        await this.loadThisYearsEvents(this.displayingYear);
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

  async loadThisYearsEvents(year: number) {
    this.loading = true;
    try {
      this.displayingYear = year;
      this.allEvents = await this.fs.getEventsByYear(year);
      this.groupedEvents = this.groupEventsByMonth(this.allEvents);
      console.log(this.groupedEvents);

      this.extractEventDates(this.allEvents);
    } catch {
    } finally {
      this.loading = false;
    }
  }

  onCalandarViewChanged(view: 'month' | 'year' | 'multi-year') {
    console.log('Calendar view changed:', view);
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

  loadLastYear(){

  }
  calandarClick(date: any) {
    console.log('Clicked date:', date.toISOString());
    const event = this.allEvents.find(
      (event) =>
        new Date(event.event_info.function_date).toISOString() ===
        date.toISOString(),
    );
    if (event) {
      this.openEventDetails(event);
    } else {
      console.log('No event found for this date.');
    }

    // example usage
    // this.router.navigate(['/events'], {
    //   queryParams: { date: date.toISOString() }
    // });
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

private groupEventsByMonth(
  events: EvolveEvent[],
  year: number = new Date().getFullYear()
): EventGroup[] {

  // 1. Create all 12 months first
  const monthMap: { [key: string]: EventGroup } = {};
  const result: EventGroup[] = [];

  for (let month = 0; month < 12; month++) {
    const date = new Date(year, month, 1);

    const monthKey = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const group: EventGroup = {
      month: monthKey,
      events: [],
    };

    monthMap[monthKey] = group;
    result.push(group);
  }

  // 2. Push events into their month bucket
  events.forEach(event => {
    const date = new Date(event.event_info.function_date);

    if (date.getFullYear() !== year) return; // ignore other years

    const monthKey = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    monthMap[monthKey]?.events.push(event);
  });

  return result;
}


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.$authSub?.unsubscribe();
    this.$eventSub?.unsubscribe();
  }
}
