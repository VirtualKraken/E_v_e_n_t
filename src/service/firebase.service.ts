import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  getDocs,
  addDoc
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

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
}
