import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { query, orderBy, limit, where, Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  normalNotes: Note[] = []; 
  normalMarkedNotes: Note[] = [];
  trashNotes: Note[] = [];

  unsubNotes;
  unsubTrash;
  unsubMarkedNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNoteList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
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
  async addNote(item: Note, itemFolder:string){
    if (itemFolder =="notes") {
      await addDoc(this.getNotesRef(),item).catch(
        (err) => {console.error(err) }
      ).then(
        (docRef) => {console.log("Document mit ID", docRef?.id);}
      )  
    } else {
      await addDoc(this.getTrashRef(),item).catch(
        (err) => {console.error(err) }
      ).then(
        (docRef) => {console.log("Document mit ID", docRef?.id);}
      )  
    }
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
    this.unsubMarkedNotes();
  }

  /**
   * Abonniert die Notizen
   * @orderBy kann man als Filter verwenden
   * @list in der Dokumentation wird das als Snapshot bezeichnet
   * @docChanges gibt die Änderungen an den Dokumenten zurück
   */
  subNoteList() {
    const q = query(this.getNotesRef(), orderBy("title"), limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed note: ", change.doc.data());
        }
      })
    });
  }

  /**
   * Abonniert die markierten Notizen
   * @where wird als Filter verwendet
   * @list in der Dokumentation wird das als Snapshot bezeichnet
   */
  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
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
