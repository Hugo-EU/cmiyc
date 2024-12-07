import { useEffect, useState } from 'react';
import { auth } from '@/app/firebase/config';

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      });
    }
  }, []);

  if (!user) return null;

  return (
    <div className="absolute top-4 left-4 flex items-center space-x-3">
      <img
        src={user.photoURL}
        alt="User Avatar"
        className="w-10 h-10 rounded-full"
      />
      <p className="text-white">{user.displayName}</p>
    </div>
  );
};

export default UserProfile;
