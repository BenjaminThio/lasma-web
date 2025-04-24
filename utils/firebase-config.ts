import { FirebaseOptions, FirebaseApp, initializeApp } from 'firebase/app';

const firebaseApiKey: string = process.env.FIREBASE_API_KEY as string;
/*
const firebaseAuthDomain: string = process.env.FIREBASE_AUTH_DOMAIN as string;
const firebaseProjectId: string = process.env.FIREBASE_PROJECT_ID as string;
const firebaseStorageBucket: string = process.env.FIREBASE_STORAGE_BUCKET as string;
const firebaseMessagingSenderId: string = process.env.FIREBASE_MESSAGING_SENDER_ID as string;
const firebaseAppId: string = process.env.FIREBASE_APP_ID as string;
const firebaseMeasurementId: string = process.env.FIREBASE_MEASUREMENT_ID as string;
*/
const firebaseConfig: FirebaseOptions = {
    apiKey: firebaseApiKey,
    authDomain: "lasma-studio.firebaseapp.com",
    projectId: "lasma-studio",
    storageBucket: "lasma-studio.firebasestorage.app",
    messagingSenderId: "1017985598917",
    appId: "1:1017985598917:web:59cfcf316994e1dc49f7ac",
    measurementId: "G-JN3ECEV7GR"
};
  
/*
const firebaseConfig: FirebaseOptions = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
    measurementId: firebaseMeasurementId
};
*/

const app: FirebaseApp = initializeApp(firebaseConfig);

export default app;