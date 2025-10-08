import React, { useEffect, useState } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-2xl p-4 flex items-center gap-4 animate-slideUp">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <FaDownload className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm mb-1">Install App</h3>
          <p className="text-white/80 text-xs">
            Install for faster access and offline use
          </p>
        </div>
        <button
          onClick={handleInstallClick}
          className="px-4 py-2 bg-white text-orange-600 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstall(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <FaTimes size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;