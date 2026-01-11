import {
  Injectable,
  Injector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getCountFromServer,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot,
  limit,
  getDocs,
} from '@angular/fire/firestore';
import { Auth, authState, user } from '@angular/fire/auth';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { Observable, filter, switchMap } from 'rxjs';
import { EventQuote, EvolveEvent } from '../app/types/quotes';

/* =========================
   Interfaces
========================= */

export interface Vendor {
  id?: string;
  name: string;
  service: string;
  location?: string;
  phone?: string;
  notes?: string;
}

/* =========================
   Service
========================= */

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(Auth);
  private injector = inject(Injector);
  private uid: string | null = null;
  user$ = user(this.auth);

  constructor() {
    authState(this.auth)
      .pipe(filter((user) => !!user))
      .subscribe((user) => {
        this.uid = user!.uid;
      });
  }

  /* =========================
     Helpers
  ========================= */

  private requireAuth(): string {
    if (!this.uid) {
      throw new Error('User not authenticated');
    }
    return this.uid;
  }

  private userPath(): string {
    return `users/${this.requireAuth()}`;
  }

  /* =========================
     Dashboard Stats
  ========================= */
  async getDashboardStats(days: number = 360) {
    const uid = this.requireAuth();

    const eventsRef = collection(this.firestore, 'events');

    // Not using date filter.
    const fromDate = Timestamp.fromMillis(
      Date.now() - days * 24 * 60 * 60 * 1000
    );

    const baseQuery = query(eventsRef, where('ownerId', '==', uid));

    const now = new Date().toISOString();

    const upcomingQuery = query(
      eventsRef,
      where('ownerId', '==', uid),
      where('event_info.confirmed', '==', true),
      where('event_info.function_date', '>', now)
    );

    const completedQuery = query(
      eventsRef,
      where('ownerId', '==', uid),
      where('event_info.confirmed', '==', false),
      where('event_info.function_date', '<=', now)
    );

    const [totalSnap, upcomingSnap, completedSnap] = await Promise.all([
      getCountFromServer(baseQuery),
      getCountFromServer(upcomingQuery),
      getCountFromServer(completedQuery),
    ]);

    const total = totalSnap.data().count;
    const upcoming = upcomingSnap.data().count;
    const completed = completedSnap.data().count;

    return {
      total,
      upcoming,
      completed,
      conversion: 0,
    };
  }

  /* =========================
     Storage (Quotes)
  ========================= */

  async uploadFileToStorage(file: File): Promise<string> {
    const uid = this.requireAuth();
    const filePath = `quotes/${uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);
    const uploadResult = await uploadBytes(storageRef, file);
    return getDownloadURL(uploadResult.ref);
  }

  deleteFile(fileUrl: string): Promise<void> {
    const fileRef = ref(this.storage, fileUrl);
    return deleteObject(fileRef);
  }

  /* =========================
     Quote Uploads
  ========================= */

  addFileToFirestore(fileData: EventQuote) {
    const filesRef = collection(
      this.firestore,
      `${this.userPath()}/quote_uploads`
    );
    return addDoc(filesRef, fileData);
  }

  getUploadedFiles(): Observable<EventQuote[]> {
    const filesRef = collection(
      this.firestore,
      `${this.userPath()}/quote_uploads`
    );
    const q = query(filesRef, orderBy('uploadedAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<EventQuote[]>;
  }

  /* =========================
     Events (TOP-LEVEL)
  ========================= */

  async createEvent(initialData: Partial<EvolveEvent>): Promise<string> {
    const uid = this.requireAuth();

    const eventsRef = collection(this.firestore, 'events');
    const docRef = await addDoc(eventsRef, {
      ...initialData,
      ownerId: uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return docRef.id;
  }

  getEvent(eventId: string): Observable<EvolveEvent | undefined> {
    const eventRef = doc(this.firestore, `events/${eventId}`);
    return docData(eventRef, { idField: 'id' }) as Observable<
      EvolveEvent | undefined
    >;
  }

  updateEvent(
    eventId: string,
    dataToUpdate: Partial<EvolveEvent>
  ): Promise<void> {
    const eventRef = doc(this.firestore, `events/${eventId}`);
    return updateDoc(eventRef, {
      ...dataToUpdate,
      updatedAt: new Date(),
    });
  }

  async getEventsPaged(
    pageSize: number,
    lastDoc: QueryDocumentSnapshot | null = null
  ) {
    return runInInjectionContext(this.injector, async () => {
      const uid = this.requireAuth();
      const eventsRef = collection(this.firestore, 'events');

      // Build the query
      let q;
      if (lastDoc) {
        q = query(
          eventsRef,
          where('ownerId', '==', uid),
          orderBy('event_info.function_date', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          eventsRef,
          where('ownerId', '==', uid),
          orderBy('event_info.function_date', 'desc'),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(q);

      // Return both the data and the last visible document for the next page
      return {
        events: querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as EvolveEvent)
        ),
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      };
    });
  }

  getEventsList(): Observable<EvolveEvent[]> {
    // 2. Wrap the entire query logic in runInInjectionContext
    return runInInjectionContext(this.injector, () => {
      const uid = this.requireAuth(); // This is now safe if it uses inject() too

      const eventsRef = collection(this.firestore, 'events');
      const q = query(
        eventsRef,
        where('ownerId', '==', uid),
        orderBy('event_info.function_date', 'desc')
      );

      return collectionData(q, { idField: 'id' }) as Observable<EvolveEvent[]>;
    });
  }

  /* =========================
     Vendors (USER-SCOPED)
  ========================= */

  private getUserVendorsPath(uid: string) {
    return `users/${uid}/vendors`;
  }

  // 3. Refactor getVendors to be reactive
  getVendors(): Observable<Vendor[]> {
    return this.user$.pipe(
      filter((u) => !!u), // Wait until user is logged in
      switchMap((u) => {
        const vendorsRef = collection(
          this.firestore,
          this.getUserVendorsPath(u!.uid)
        );
        const q = query(vendorsRef, orderBy('name', 'asc'));
        return collectionData(q, { idField: 'id' }) as Observable<Vendor[]>;
      })
    );
  }

  async addVendor(vendor: Vendor) {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not authenticated');
    const vendorsRef = collection(
      this.firestore,
      this.getUserVendorsPath(u.uid)
    );
    return addDoc(vendorsRef, vendor);
  }

  async updateVendor(vendor: Vendor) {
    const u = this.auth.currentUser;
    if (!u || !vendor.id) throw new Error('Invalid state');
    const docRef = doc(
      this.firestore,
      `${this.getUserVendorsPath(u.uid)}/${vendor.id}`
    );
    const { id, ...data } = vendor;
    return updateDoc(docRef, data);
  }

  deleteVendor(vendorId: string) {
    const docRef = doc(
      this.firestore,
      `${this.userPath()}/vendors/${vendorId}`
    );
    return deleteDoc(docRef);
  }
}
