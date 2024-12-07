import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase/config';

export const getUserRole = async () => {
  if (!auth.currentUser) return null;

  try {
    const docRef = doc(db, 'users', auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().role;
    } else {
      await setDoc(docRef, { role: 'user' });
      return 'user';
    }
  } catch (error) {
    console.error('Error al obtener el rol del usuario:', error);
    return null;
  }
};
