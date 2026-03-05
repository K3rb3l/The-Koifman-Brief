import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAOex7aRLvN5kW8RrRE4PoOFB9ytEHZLZU',
  authDomain: 'the-koifman-brief.firebaseapp.com',
  projectId: 'the-koifman-brief',
  storageBucket: 'the-koifman-brief.firebasestorage.app',
  messagingSenderId: '283874833646',
  appId: '1:283874833646:web:d917e1dec22018bfae2fff',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
