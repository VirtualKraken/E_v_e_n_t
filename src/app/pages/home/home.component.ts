import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../service/firebase.service';
import { EvolveEvent } from '../../types/quotes';
import { AuthService } from '../../../service/auth.service';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';

// Interface for your UI grouping
interface EventGroup {
  month: string; // e.g., "December 2025"
  events: EvolveEvent[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
})
export class HomeComponent implements OnInit {
  // This is what the HTML will iterate over
  groupedEvents: EventGroup[] = [];
  loading = true;
  user: any;

  // Store event dates for quick lookup
  eventDates: Set<string> = new Set();

  constructor(
    private router: Router,
    private fs: FirebaseService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.user = localStorage.getItem('eeUser');
    // Fetch all events
    const filters = {
      user: this.user,
    };

    this.fs.getEventsList(filters).subscribe((events) => {
      this.groupedEvents = this.groupEventsByMonth(events);
      this.extractEventDates(events);
      this.loading = false;
    });
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
    events.forEach(event => {
      const date = new Date(event.event_info.function_date);
      // Format as YYYY-MM-DD for consistent comparison
      const dateString = date.toISOString().split('T')[0];
      this.eventDates.add(dateString);
    });
  }

  // Function to add custom class to calendar dates with events
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only apply to month view
    if (view === 'month') {
      const dateString = cellDate.toISOString().split('T')[0];
      return this.eventDates.has(dateString) ? 'has-event' : '';
    }
    return '';
  };

  // --- Helper to Group Events by Month ---
  private groupEventsByMonth(events: EvolveEvent[]): EventGroup[] {
    // 1. Sort events by Date (Newest first)
    const sortedEvents = events.sort((a, b) => {
      return (
        new Date(b.event_info.function_date).getTime() -
        new Date(a.event_info.function_date).getTime()
      );
    });

    const groups: { [key: string]: EvolveEvent[] } = {};

    // 2. Group them
    sortedEvents.forEach((event) => {
      const date = new Date(event.event_info.function_date);
      // Create key like "December 2025"
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });

    // 3. Convert Object to Array for *ngFor
    return Object.keys(groups).map((key) => ({
      month: key,
      events: groups[key],
    }));
  }
}
