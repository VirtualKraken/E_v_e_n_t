import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth, User } from '@angular/fire/auth';
import { AssetDetails, EvolveEvent } from '../../types/quotes';
import { FirebaseService } from '../../../service/firebase.service';
import { ThemeServiceService } from '../../../service/theme-service.service';

@Component({
  selector: 'app-production-checklist',
  templateUrl: './production-checklist.component.html',
  styleUrl: './production-checklist.component.scss',
  standalone: false,
})
export class ProductionChecklistComponent {
  mode: 'admin' | 'production' = 'admin';
  currentEventId: string | null = null;
  eventData: EvolveEvent | null = null;

  constructor(
    private route: ActivatedRoute,
    private auth: Auth,
    private firebaseService: FirebaseService,
    private ts: ThemeServiceService
  ) {}

  ngOnInit() {
    this.mode = this.route.snapshot.data['mode'] ?? 'admin';

    const user = this.auth.currentUser;

    console.log('Mode:', this.mode);

    if (user) {
      console.log('UID:', user.uid);
      console.log('Is Anonymous:', user.isAnonymous);
      console.log('Providers:', user.providerData);
      console.log(
        'Provider IDs:',
        user.providerData.map((p) => p.providerId)
      );
    } else {
      console.log('No user logged in');
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currentEventId = id;
      this.fetchEvent(id);
    } else {
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
  async handleEventSave(data: AssetDetails, eventdetailsType: string) {
    console.log(data);

    try {
      if (!this.currentEventId) {
        return;
      }
      await this.firebaseService.updateEvent(this.currentEventId, {
        [eventdetailsType]: data,
      });
      this.ts.showNotification('Event updated!');
    } catch (error) {
      console.error('Save failed', error);
    }
  }
}
