'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getCartItems } from '@/app/helpers/cart';

const Header = () => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const items = await getCartItems(currentUser.uid);
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalQuantity);
      } else {
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024); 
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
  
      document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  
      router.push('/sign-in');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  return (
    <header className="navbar bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white shadow-lg fixed top-0 left-0 z-50">
      <div className="navbar-start space-x-2">
        {[
          { href: '/', icon: '/icons/home.svg', label: 'Inicio' },
          { href: '/store', icon: '/icons/store.svg', label: 'Tienda' },
          { href: '/forum', icon: '/icons/forum.svg', label: 'Foro' },
          { href: '/songs', icon: '/icons/music.svg', label: 'Canciones' },
          { href: '/events', icon: '/icons/events.svg', label: 'Eventos' },
        ].map(({ href, icon, label }) => (
          <button
            key={href}
            className="btn btn-ghost btn-sm text-lg flex items-center space-x-2"
            onClick={() => router.push(href)}
          >
            <img src={icon} className="w-6 h-6" alt={label} />
            {!isCompact && <span>{label}</span>}
          </button>
        ))}
      </div>
      {!isCompact && (
        <div
          className="indicator cursor-pointer"
          onClick={() => router.push('/')}
        >
          <img src="/logos/logo.png" className="navbar-center w-20 h-20" alt="Logo" />
        </div>
      )}
      <div className="navbar-end space-x-4">
        {user && (
          <div
            className="indicator cursor-pointer"
            onClick={() => router.push('/cart')}
          >
            <img
              src="/icons/cart.svg"
              alt="Carrito"
              className="w-6 h-6"
            />
            {cartCount > 0 && (
              <span className="badge badge-sm indicator-item">{cartCount}</span>
            )}
          </div>
        )}
        {user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="flex items-center space-x-2 cursor-pointer">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={user.photoURL || '/avatars/default-avatar.jpg'}
                    alt="Avatar"
                  />
                </div>
              </div>
              {!isCompact && <span className="font-semibold">{user.displayName || user.email}</span>}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-white text-black rounded-box w-52"
            >
              <li>
                <button
                  onClick={() => router.push('/profile')}
                  className="hover:bg-gray-200"
                >
                  Perfil
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:bg-gray-200"
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <>
            <button
              onClick={() => router.push('/sign-up')}
              className="btn btn-primary btn-sm"
            >
              Registrarse
            </button>
            <button
              onClick={() => router.push('/sign-in')}
              className="btn btn-secondary btn-sm"
            >
              Iniciar sesión
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
