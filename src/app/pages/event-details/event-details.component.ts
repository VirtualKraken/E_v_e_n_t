import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../service/firebase.service';
import { EventInfo, EvolveEvent } from '../../types/quotes';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
  standalone: false,
})
export class EventDetailsComponent {
  currentEventId: string | null = null;
  eventData: EvolveEvent | null = null;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.fetchEvent();
  }

  fetchEvent() {
    this.firebaseService.getEvent('U0cqdDIevhDemGb36DMn').subscribe((event) => {
      if (event) {
        this.eventData = event;
        console.log(event); // Works perfectly!
      }
    });
  }

  // 1. Handle "Event Info" Save
  async handleInfoSave(data: EventInfo) {
    try {
      if (!this.currentEventId) {
        // --- CREATE (First Save) ---
        // We pass { event_info: data } because it's a Partial<Event>
        this.currentEventId = await this.firebaseService.createEvent({
          event_info: data,
        });

        console.log('Created new Event!', this.currentEventId);
        // Add a Toast/Snackbar notification here: "Event Created"
      } else {
        // --- UPDATE (Subsequent Saves) ---
        await this.firebaseService.updateEvent(this.currentEventId, {
          event_info: data,
        });

        console.log('Updated Event Info');
        // Add a Toast/Snackbar notification here: "Info Updated"
      }
    } catch (error) {
      console.error('Save failed', error);
    }
  }
}
