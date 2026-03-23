import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAOex7aRLvN5kW8RrRE4PoOFB9ytEHZLZU',
  authDomain: 'the-koifman-brief.firebaseapp.com',
  projectId: 'the-koifman-brief',
  storageBucket: 'the-koifman-brief.firebasestorage.app',
  messagingSenderId: '283874833646',
  appId: '1:283874833646:web:d917e1dec22018bfae2fff',
  measurementId: 'G-T12XEKFE2F',
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
export const functions = getFunctions(app)
export const storage = getStorage(app)

// Initialize analytics (browser only)
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) getAnalytics(app)
  })
}
