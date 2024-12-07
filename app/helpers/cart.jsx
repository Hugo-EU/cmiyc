import { db } from '@/app/firebase/config';
import { doc, setDoc, getDocs, getDoc, collection, deleteDoc } from 'firebase/firestore';


export const getCartItems = async (userId) => {
  const cartRef = collection(db, 'carts', userId, 'items');
  const snapshot = await getDocs(cartRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};


export const addItemToCart = async (userId, product) => {
  const uniqueId = `${product.id}-${product.selectedSize}`;
  const productRef = doc(db, 'carts', userId, 'items', uniqueId);
  const existingItem = await getDoc(productRef);

  if (existingItem.exists()) {
    const currentQuantity = existingItem.data().quantity || 0;
    await setDoc(
      productRef,
      { ...existingItem.data(), quantity: currentQuantity + 1 },
      { merge: true }
    );
  } else {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: product.selectedSize,
    };
    await setDoc(productRef, cartItem, { merge: true });
  }
};


export const updateCartItemQuantity = async (userId, uniqueId, quantity) => {
  const itemRef = doc(db, `carts/${userId}/items`, uniqueId);
  await setDoc(itemRef, { quantity }, { merge: true });
};



export const removeItemFromCart = async (userId, uniqueId) => {
  const productRef = doc(db, 'carts', userId, 'items', uniqueId);
  await deleteDoc(productRef);
};



export const clearCart = async (userId) => {
  const cartRef = collection(db, 'carts', userId, 'items');
  const snapshot = await getDocs(cartRef);
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};
