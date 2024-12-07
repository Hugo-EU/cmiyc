import { db } from '@/app/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';


export const getProducts = async () => {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addProduct = async (productData) => {
  const productsRef = collection(db, 'products');
  const newProductRef = doc(productsRef);
  await setDoc(newProductRef, { ...productData, id: newProductRef.id });
};

export const updateProduct = async (product) => {
  const productRef = doc(db, 'products', product.id);
  await setDoc(productRef, product, { merge: true });
};


export const deleteProduct = async (productId) => {
  const productRef = doc(db, 'products', productId);
  await deleteDoc(productRef);
};
