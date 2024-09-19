import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), 
    provideFirebaseApp(() => initializeApp({"projectId":"danotes-82690","appId":"1:213809787176:web:e3e9c5b9d9028acd5a601d","storageBucket":"danotes-82690.appspot.com","apiKey":"AIzaSyAA_tinu_c3sE7wDo40tfppLrptvNv1ncg","authDomain":"danotes-82690.firebaseapp.com","messagingSenderId":"213809787176"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
