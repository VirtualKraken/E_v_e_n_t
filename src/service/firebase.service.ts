import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc, // <--- Added this for deleting vendors
  query,
  orderBy,
  where,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { EventQuote, EvolveEvent } from '../app/types/quotes';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage'; // <--- Import Storage

// define interface here or in your types file
export interface Vendor {
  id?: string;
  name: string;
  service: string;
  location?: string;
  phone?: string;
  notes?: string;
}
// Interface for your uploaded files

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firestore = inject(Firestore);
  private storage = inject(Storage); // <--- Inject Storage

  // 1. Upload raw file to Firebase Storage bucket
  async uploadFileToStorage(file: File): Promise<string> {
    const filePath = `quotes/${Date.now()}_${file.name}`; // Unique path
    const storageRef = ref(this.storage, filePath);
    const uploadResult = await uploadBytes(storageRef, file);
    return getDownloadURL(uploadResult.ref);
  }

  deleteFile(fileUrl: string): Promise<void> {
    // Create a reference from the full download URL
    const fileRef = ref(this.storage, fileUrl);
    return deleteObject(fileRef);
  }

  // 2. Save file metadata (URL, name) to Firestore Database
  addFileToFirestore(fileData: EventQuote) {
    const filesRef = collection(this.firestore, 'quote_uploads');
    return addDoc(filesRef, fileData);
  }

  // 3. Get list of uploaded files from Firestore
  getUploadedFiles(): Observable<EventQuote[]> {
    const filesRef = collection(this.firestore, 'quote_uploads');
    const q = query(filesRef, orderBy('uploadedAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<EventQuote[]>;
  }

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
  getEventsList({ user }: { user: string }): Observable<EvolveEvent[]> {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, orderBy('event_info.function_date', 'desc'));

    return (
      collectionData(q, { idField: 'id' }) as Observable<EvolveEvent[]>
    ).pipe(
      map((events) => {
        // Admin user sees everything
        if (user === 'evolve') {
          return events;
        }

        // Regular users see only their assigned events
        return events.filter(
          (event) => event.event_asset_details?.shared_with === user
        );
      })
    );
  }

  // ==========================================================
  // ✅ VENDOR MANAGEMENT
  // ==========================================================

  getVendors(): Observable<Vendor[]> {
    const vendorsRef = collection(this.firestore, 'vendors');
    // You can add orderBy here if you want them sorted by name
    const q = query(vendorsRef, orderBy('name', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Vendor[]>;
  }

  addVendor(vendor: Vendor) {
    const vendorsRef = collection(this.firestore, 'vendors');
    return addDoc(vendorsRef, vendor);
  }

  updateVendor(vendor: Vendor) {
    if (!vendor.id) throw new Error('Vendor ID is missing');
    const docRef = doc(this.firestore, `vendors/${vendor.id}`);
    // Destructure to separate ID from data to avoid saving ID inside the document field
    const { id, ...data } = vendor;
    return updateDoc(docRef, data);
  }

  deleteVendor(id: string) {
    const docRef = doc(this.firestore, `vendors/${id}`);
    return deleteDoc(docRef);
  }
}
