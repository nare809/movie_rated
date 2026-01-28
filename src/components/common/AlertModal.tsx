import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FaceIcon from './FaceIcon';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, message }) => {
  const { openSignInModal } = useAuth();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    openSignInModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 mb-6">
            <div className="scale-[2.5]">
              <FaceIcon className="w-5 h-5 text-pink-500" />
            </div>
          </div>
          
          <h2 className="text-xl font-black text-foreground mb-2">Wait a second!</h2>
          <p className="text-muted-foreground text-sm font-bold leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={handleSignIn}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
               <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                 <div className="scale-125">
                   <FaceIcon className="w-3.5 h-3.5 text-white" />
                 </div>
               </div>
              Sign in now
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-secondary hover:bg-accent text-secondary-foreground font-bold py-3 rounded-2xl transition-all border border-black/10 dark:border-white/10"
            >
              Maybe later
            </button>
          </div>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
