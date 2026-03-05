import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Admin } from '@/types/post'

const adminsRef = collection(db, 'admins')

export async function isAdmin(uid: string): Promise<boolean> {
  const docSnap = await getDoc(doc(db, 'admins', uid))
  return docSnap.exists()
}

export async function getAllAdmins(): Promise<(Admin & { uid: string })[]> {
  const snapshot = await getDocs(adminsRef)
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }) as Admin & { uid: string })
}

export async function addAdmin(uid: string, email: string): Promise<void> {
  await setDoc(doc(db, 'admins', uid), {
    email,
    createdAt: Timestamp.now(),
  })
}

export async function removeAdmin(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'admins', uid))
}
