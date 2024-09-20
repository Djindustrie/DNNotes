import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, doc, collectionData, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = []; 

  unsubList;
  unsubSingle;

  item$;
  item;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubList =  onSnapshot(this.getNotesRef(), (list) => {
      list.forEach(element => {
        console.log(element);
      })
    });

    this.unsubSingle =  onSnapshot(this.getSingleDocRef("notes", ""), (element) => {
    });

    this.unsubSingle();
    this.unsubList();

    this.item$ = collectionData(this.getNotesRef());
    this.item = this.item$.subscribe((list) => {
      list.forEach(element => {
        console.log(element);
      });
    });
    this.item.unsubscribe();
  }

  getNotesRef(){
    return collection(this.firestore, 'notes');
  }

  getTrashRef(){
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId:string, docID:string) {
    return doc(collection(this.firestore, colId), docID);
  }
}
