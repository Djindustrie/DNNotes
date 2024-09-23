import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
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

  /**
   * Notiz löschen
   */
  async deleteNote(colID: "notes" | "trash", docID: string){
    await deleteDoc(this.getSingleDocRef(colID, docID)).catch(
      (err) => {console.error(err, "Docment konnte nicht geluöscht werden")}
    )
  }

  /**
   * Notiz erstellen 
   * Wird an add-Note-Dialog.ts übergeben
   */
  async addNote(item: Note, colID: "notes" | "trash"){
     await addDoc(this.getNotesRef(),item).catch(
      (err) => {console.error(err) }
    ).then(
      (docRef) => {console.log("Document mit ID", docRef?.id);}
    )    
  }


  /**
   * Update von Notizen
   */
  async updateNote(note: Note,){
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => {console.error(err) }
      )
    }
  }

  /**
   * Hilfsfunktion um den Boolean-Wert "notes" oder "trash" zurückzugeben
   */
  getColIdFromNote(note: Note){
    if (note.type == "note") {
      return "notes";
    } else {
      return "trash";
    }
  }

  /**
   * Hilfsfunktion um ein sauberes JSON-Objekt zu erhalten
   */
  getCleanJson(note: Note){
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    }
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
