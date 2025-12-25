import { inject, Injectable } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore = inject(Firestore);
  itemCollection = collection(this.firestore, 'users');
  item$ = collectionData<any>(this.itemCollection);
}
