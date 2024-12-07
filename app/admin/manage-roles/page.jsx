'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase/config';
import { deleteUser } from 'firebase/auth';
import AlertHelper from "@/app/helpers/alerts";

const ManageRoles = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const userDoc = doc(db, 'users', userId);
      await deleteDoc(userDoc);

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        await deleteUser(currentUser);
      }

      AlertHelper.success('Usuario eliminado.');
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      AlertHelper.error('Error al eliminar usuario.');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { role: newRole });

      AlertHelper.success('Rol actualizado.');
      fetchUsers();
    } catch (error) {
      console.error('Error al actualizar el rol:', error);
      AlertHelper.error('Error al actualizar el rol.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-full max-w-4xl">
        <h1 className="text-white text-2xl mb-5">Administrar roles de usuarios</h1>
        <ul className="space-y-4">
          {users.map((user) => (
            <li
              key={user.id}
              className="text-white flex justify-between items-center bg-gray-700 p-4 rounded"
            >
              <div>
                <p className="font-bold">{user.email || 'No Email'}</p>
                <p className="text-sm">Rol actual: {user.role || 'No Rol'}</p>
              </div>
              <div className="flex space-x-4">
                <select
                  value={user.role || 'user'}
                  onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  className="bg-gray-800 text-white p-2 rounded"
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageRoles;
