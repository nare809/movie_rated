import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show prompt after a short delay if app is installable
    if (isInstallable) {
      const timer = setTimeout(() => {
        // Only show if not dismissed in this session
        const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
        if (!isDismissed) {
          setIsVisible(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleInstall = () => {
    installApp();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-80 bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center justify-between z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Download size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">Install VidPlay</h4>
          <p className="text-[10px] text-muted-foreground leading-tight">Add to home screen for a better experience</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={handleInstall}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-colors"
        >
          Install
        </button>
        <button 
          onClick={handleDismiss}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
