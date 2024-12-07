import { getAuth } from 'firebase-admin/auth';

export async function verifyToken(token) {
  const auth = getAuth();
  const decodedToken = await auth.verifyIdToken(token);
  const userRole = decodedToken.role || 'user';
  return { uid: decodedToken.uid, role: userRole };
}
