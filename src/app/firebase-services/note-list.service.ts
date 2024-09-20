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

  unsubTrash;
  unsubNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNoteList();
    this.unsubTrash = this.subTrashList();
  }

  ngonDestroy() {
    this.unsubNotes();
    this.unsubTrash();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  subNoteList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  }

  /*
  * Firestore References für die Notizen
  */
  getNotesRef(){
    return collection(this.firestore, 'notes');
  }

  /**
   * Firestore References für den Trash
   */
  getTrashRef(){
    return collection(this.firestore, 'trash');
  }

  /**
   * Firestore References für ein einzelnes Dokument
   */
  getSingleDocRef(colId:string, docID:string) {
    return doc(collection(this.firestore, colId), docID);
  }
}
