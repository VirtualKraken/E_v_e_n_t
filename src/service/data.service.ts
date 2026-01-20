import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  eventListCache: any[] = [];
  constructor() {}

  setEvents(events: any[]) {
    this.eventListCache = events;
  }

  getEvents() {
    return this.eventListCache;
  }
}
