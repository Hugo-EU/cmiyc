"use client";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getUserRole } from '@/app/helpers/roles';
import { useRouter } from 'next/navigation';
import AlertHelper from "@/app/helpers/alerts";

const auth = getAuth();

const Profile = () => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setSelectedAvatar(currentUser.photoURL || '/avatars/avatar1.jpg');
        const userRole = await getUserRole();
        setRole(userRole);
      } else {
        router.push('/sign-in');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasSpecialChar;
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(user, { displayName, photoURL: selectedAvatar });
      AlertHelper.success('Perfil actualizado correctamente');
    } catch (error) {
      AlertHelper.error('Error al actualizar el perfil');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      AlertHelper.warning('Por favor, completa ambos campos de contraseña.');
      return;
    }

    if (!validatePassword(newPassword)) {
      AlertHelper.warning('La nueva contraseña debe tener al menos una mayúscula, una minúscula y un carácter especial.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      AlertHelper.success('Contraseña actualizada correctamente');
    } catch (error) {
      AlertHelper.error('Error al cambiar la contraseña. Por favor, revisa tu contraseña actual.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-97">
        <h1 className="text-white text-2xl mb-5">Perfil</h1>
        {user && (
          <>
            <div className="mb-4">
              <p className="text-gray-400">Nombre actual: {user.displayName || 'No definido'}</p>
              <input
                type="text"
                placeholder="Nuevo nombre de usuario"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 mt-2 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
              />
            </div>
            <div className="mb-4">
              <p className="text-gray-400">Selecciona tu avatar:</p>
              <div className="flex space-x-2 mt-2">
                {['/avatars/avatar1.jpg', '/avatars/avatar2.jpg', '/avatars/avatar3.jpg', '/avatars/avatar4.jpg', '/avatars/avatar5.jpg'].map((avatar) => (
                  <img
                    key={avatar}
                    src={avatar}
                    alt="Avatar"
                    className={`w-16 h-16 rounded-full cursor-pointer border-2 ${selectedAvatar === avatar ? 'border-indigo-500' : 'border-gray-500'
                      }`}
                    onClick={() => setSelectedAvatar(avatar)}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleUpdateProfile}
              className="w-full p-3 mb-4 bg-indigo-600 rounded text-white hover:bg-indigo-500"
            >
              Actualizar Perfil
            </button>
          </>
        )}
        <h2 className="text-white text-xl mb-5 mt-6">Cambiar Contraseña</h2>
        <div className="relative mb-4">
          <input
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
          />
          <button
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showCurrentPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <div className="relative mb-4">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
          />
          <button
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showNewPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <button
          onClick={handleChangePassword}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Cambiar Contraseña
        </button>
        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full p-3 bg-gray-700 rounded text-white hover:bg-gray-600"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Profile;
