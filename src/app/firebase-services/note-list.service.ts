import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  normalNotes: Note[] = []; 
  trashNotes: Note[] = [];

  unsubNotes;
  unsubTrash;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNoteList();
    this.unsubTrash = this.subTrashList();
  }

  async updatNote(colId:string, docID:string, item: {}){
    await updateDoc(this.getSingleDocRef(colId, docID), item).catch(
      (err) => {console.error(err) }
    ).then(
      () => {console.log("updatNote mit ID", docID, "wurde geupdated");}
    )
  }

  /**
   * Notiz erstellen 
   * Wird an add-Note-Dialog.ts übergeben
   */
  async addNote(item: Note){
     await addDoc(this.getNotesRef(),item).catch(
      (err) => {console.error(err) }
    ).then(
      (docRef) => {console.log("Document mit ID", docRef?.id);}
    )    
  }

  ngonDestroy() {
    this.unsubNotes();
    this.unsubTrash();
  }

  /**
   * Abonniert die Notizen
   */
  subNoteList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  /**
   * Abonniert den Trash
   */
  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
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
