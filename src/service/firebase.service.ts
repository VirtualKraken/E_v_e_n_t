import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc
} from '@angular/fire/firestore';
import { from, Observable,map } from 'rxjs';
import { EvolveEvent } from '../app/types/quotes';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firestore = inject(Firestore);

  getUsers$(): Observable<any[]> {
    const q = query(collection(this.firestore, 'users'));
    return from(
      getDocs(q).then(snap =>
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      )
    );
  }

  addTestDoc() {
    return addDoc(collection(this.firestore, 'test'), {
      message: 'Firestore connected',
      createdAt: new Date(),
    });
  }

  getEvent(eventId: string): Observable<EvolveEvent | undefined> {
    const docRef = doc(this.firestore, 'events', eventId);

    // getDoc returns a Promise, convert to Observable
    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          // Spread the data and include the ID just in case you need it later
          return { id: snapshot.id, ...snapshot.data() } as EvolveEvent;
        } else {
          return undefined; // Handle "Event not found" case
        }
      })
    );
  }

  /**
   * 1. CREATE EVENT (First Save)
   * Creates a new document in the 'events' collection.
   * Returns: A Promise that resolves to the new Document ID.
   */
  async createEvent(initialData: Partial<EvolveEvent>): Promise<string> {
    const eventsRef = collection(this.firestore, 'events');

    // addDoc automatically generates a unique ID
    const docRef = await addDoc(eventsRef, initialData);

    return docRef.id;
  }

  /**
   * 2. UPDATE EVENT (Subsequent Saves)
   * Updates specific fields (Info, Crew, Assets) without overwriting the rest.
   * Usage: updateEvent('event_123', { event_crew: [...] })
   */
  updateEvent(eventId: string, dataToUpdate: Partial<EvolveEvent>): Observable<void> {
    const docRef = doc(this.firestore, 'events', eventId);

    // updateDoc wraps in a Promise, so we convert it to Observable using 'from'
    return from(updateDoc(docRef, dataToUpdate));
  }

}
