import { FirebaseOptions, FirebaseApp, initializeApp } from 'firebase/app';

const firestoreApiKey: string = process.env.FIRESTORE_API_KEY as string;

const firebaseConfig: FirebaseOptions = {
    apiKey: firestoreApiKey,
    authDomain: 'lasma-studio.firebaseapp.com',
    projectId: 'lasma-studio',
    storageBucket: 'lasma-studio.firebasestorage.app',
    messagingSenderId: '1017985598917',
    appId: '1:1017985598917:web:59cfcf316994e1dc49f7ac',
    measurementId: 'G-JN3ECEV7GR'
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export default app;