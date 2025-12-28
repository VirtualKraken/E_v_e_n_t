import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../service/firebase.service';
import { EvolveEvent } from '../../types/quotes';

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

  constructor(
    private router: Router,
    private fs: FirebaseService
  ) {}

  ngOnInit(): void {
    // Fetch all events
    this.fs.getEventsList().subscribe((events) => {
      this.groupedEvents = this.groupEventsByMonth(events);
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

  // --- Helper to Group Events by Month ---
  private groupEventsByMonth(events: EvolveEvent[]): EventGroup[] {
    // 1. Sort events by Date (Newest first)
    const sortedEvents = events.sort((a, b) => {
      return new Date(b.event_info.function_date).getTime() -
             new Date(a.event_info.function_date).getTime();
    });

    const groups: { [key: string]: EvolveEvent[] } = {};

    // 2. Group them
    sortedEvents.forEach(event => {
      const date = new Date(event.event_info.function_date);
      // Create key like "December 2025"
      const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });

    // 3. Convert Object to Array for *ngFor
    return Object.keys(groups).map(key => ({
      month: key,
      events: groups[key]
    }));
  }
}
