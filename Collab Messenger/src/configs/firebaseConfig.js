// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBlrHW-2Y_qoGh_7ZkA3Pwk2t-G48zCPTI',
  authDomain: 'collab-messenger-5e1e8.firebaseapp.com',
  databaseURL:
    'https://collab-messenger-5e1e8-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'collab-messenger-5e1e8',
  storageBucket: 'collab-messenger-5e1e8.firebasestorage.app',
  messagingSenderId: '11193950547',
  appId: '1:11193950547:web:16790cb34ec1a3a0ea01a6',
  measurementId: 'G-W7GWNY4SWY',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
