'use client'
import { useState } from 'react';
import { auth } from '@/app/firebase/config';
import { updateProfile } from 'firebase/auth'; 
import { useRouter } from 'next/navigation';
import AlertHelper from "@/app/helpers/alerts";

const defaultAvatars = [
  '/avatars/avatar1.jpg',
  '/avatars/avatar2.jpg',
  '/avatars/avatar3.jpg',
  '/avatars/avatar4.jpg',
  '/avatars/avatar5.jpg'
];

const CompleteProfile = () => {
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState(defaultAvatars[0]);
  const router = useRouter();
  const user = auth.currentUser;

  const handleCompleteProfile = async () => {
    if (!displayName || !avatar) {
      AlertHelper.info('Introduce tu nombre y selecciona un avatar.');
      return;
    }
    try {
      await updateProfile(user, { displayName, photoURL: avatar });
      AlertHelper.success('Perfil completado');
      router.push('/');
    } catch (error) {
      AlertHelper.error('Error al completar el perfil');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-106">
        <h1 className="text-white text-2xl mb-5">Completar perfil</h1>
        
        <input 
          type="text" 
          placeholder="Nombre" 
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />

        <div className="mb-4">
          <label className="text-gray-300">Elige tu avatar:</label>
          <div className="flex space-x-4 mt-2">
            {defaultAvatars.map((url, index) => (
              <img 
                key={index}
                src={url} 
                alt="Avatar" 
                onClick={() => setAvatar(url)}
                className={`w-16 h-16 rounded-full cursor-pointer ${url === avatar ? 'border-2 border-indigo-500' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <button 
          onClick={handleCompleteProfile}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Completar perfil
        </button>
      </div>
    </div>
  );
};

export default CompleteProfile;
