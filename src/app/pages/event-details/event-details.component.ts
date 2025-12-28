import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../service/firebase.service';
import {
  EventAsset,
  EventCrew,
  EventInfo,
  EventQuote,
  EvolveEvent,
} from '../../types/quotes';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ThemeServiceService } from '../../../service/theme-service.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
  standalone: false,
})
export class EventDetailsComponent {
  currentEventId: string | null = null;
  eventData: EvolveEvent | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private ts: ThemeServiceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currentEventId = id;
      this.fetchEvent(id);
    }else{
      this.currentEventId = null;
      this.eventData = null;
    }
  }

  fetchEvent(id: string) {
    this.firebaseService.getEvent(id).subscribe((event) => {
      if (event) {
        this.eventData = event;
        console.log(event); // Works perfectly!
      }
    });
  }

  // 1. Handle "Event Info" Save
  async handleEventSave(
    data: EventInfo | EventCrew[] | EventAsset[] | EventQuote,
    eventdetailsType: string
  ) {
    console.log(data);

    try {
      if (!this.currentEventId) {
        // --- CREATE (First Save) ---
        this.currentEventId = await this.firebaseService.createEvent({
          [eventdetailsType]: data,
        });
        this.location.replaceState(`/event-details/${this.currentEventId}`);
        this.ts.showNotification('Event saved!');
      } else {
        // --- UPDATE (Subsequent Saves) ---
        await this.firebaseService.updateEvent(this.currentEventId, {
          [eventdetailsType]: data,
        });
        this.ts.showNotification('Event updated!');
      }
    } catch (error) {
      console.error('Save failed', error);
    }
  }
}
