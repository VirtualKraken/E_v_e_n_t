import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { EvolveEvent } from '../app/types/quotes';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firestore = inject(Firestore);

  // ✅ USERS LIST
  getUsers$(): Observable<any[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' });
  }

  // ✅ TEST WRITE
  addTestDoc(): Promise<any> {
    return addDoc(collection(this.firestore, 'test'), {
      message: 'Firestore connected',
      createdAt: new Date(),
    });
  }

  // ✅ SINGLE EVENT (REALTIME)
  getEvent(eventId: string): Observable<EvolveEvent | undefined> {
    const eventRef = doc(this.firestore, 'events', eventId);
    return docData(eventRef, { idField: 'id' }) as Observable<
      EvolveEvent | undefined
    >;
  }

  // ✅ CREATE EVENT
  async createEvent(initialData: Partial<EvolveEvent>): Promise<string> {
    const eventsRef = collection(this.firestore, 'events');
    const docRef = await addDoc(eventsRef, initialData);
    return docRef.id;
  }

  // ✅ UPDATE EVENT
  updateEvent(
    eventId: string,
    dataToUpdate: Partial<EvolveEvent>
  ): Promise<void> {
    const eventRef = doc(this.firestore, 'events', eventId);
    return updateDoc(eventRef, dataToUpdate);
  }

  // ✅ EVENTS LIST (ORDERED, REALTIME)
  getEventsList(): Observable<EvolveEvent[]> {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(
      eventsRef,
      orderBy('event_info.function_date', 'desc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<EvolveEvent[]>;
  }
}
