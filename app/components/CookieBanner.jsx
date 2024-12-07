'use client';
import { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = document.cookie.includes('cookieConsent=true');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = `cookieConsent=true; path=/; max-age=31536000; secure; samesite=strict`;
    setShowBanner(false);
  };

  return (
    showBanner && (
      <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg z-50">
        <p>
          Usamos cookies para mejorar tu experiencia en nuestro sitio.{" "}
          <a href="/privacy-policy" className="underline text-blue-400">
            Política de privacidad
          </a>
        </p>
        <button
          onClick={handleAccept}
          className="ml-4 bg-blue-500 px-4 py-2 rounded hover:bg-blue-400"
        >
          Aceptar
        </button>
      </div>
    )
  );
};

export default CookieBanner;
