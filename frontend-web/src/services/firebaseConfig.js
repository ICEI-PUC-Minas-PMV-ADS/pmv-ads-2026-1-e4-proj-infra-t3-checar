import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC28fCgrhf7Iy2JnpHR-8zh7Hez7SLmZ4I',
  authDomain: 'checar-d8205.firebaseapp.com',
  projectId: 'checar-d8205',
  storageBucket: 'checar-d8205.firebasestorage.app',
  messagingSenderId: '883032034365',
  appId: '1:883032034365:web:2afa2f38bfed1b156eee54',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
