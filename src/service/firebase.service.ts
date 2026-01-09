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
    const vendorsRef = collection(this.firestore, this.getUserVendorsPath(u.uid));
    return addDoc(vendorsRef, vendor);
  }

  async updateVendor(vendor: Vendor) {
    const u = this.auth.currentUser;
    if (!u || !vendor.id) throw new Error('Invalid state');
    const docRef = doc(this.firestore, `${this.getUserVendorsPath(u.uid)}/${vendor.id}`);
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
