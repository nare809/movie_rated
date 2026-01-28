import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AVATAR_PRESETS } from '../../utils/avatars';
import FaceIcon from '../common/FaceIcon';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(AVATAR_PRESETS[0].id);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || "Aww User");
      // Check if current photoURL is a preset
      if (user.photoURL && user.photoURL.startsWith('avatar:')) {
          setSelectedAvatarId(user.photoURL.split(':')[1]);
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
     setIsLoading(true);
     try {
       // Save as 'avatar:id'
       await updateUserProfile(displayName, `avatar:${selectedAvatarId}`);
       onClose();
     } catch (e) {
       console.error(e);
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden relative border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-2">
            <h2 className="text-xl font-bold text-foreground">Profile Edit</h2>
             <button
              onClick={onClose}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <X size={24} strokeWidth={3} />
            </button>
        </div>

        <div className="p-5 pt-2">
           {/* Avatar Selection */}
           <div className="mb-6">
              <p className="text-muted-foreground text-xs font-bold mb-3">Choose your Avatar</p>
              
              <div className="grid grid-cols-6 gap-2">
                   {AVATAR_PRESETS.map((preset) => (
                       <button 
                         key={preset.id}
                         onClick={() => setSelectedAvatarId(preset.id)}
                         className={`aspect-square rounded-full flex items-center justify-center transition-all ${selectedAvatarId === preset.id ? 'bg-background scale-110 ring-2 ring-primary border border-primary/20' : 'bg-secondary hover:bg-accent'}`}
                         title={preset.id}
                       >
                           <div 
                               className="w-[85%] h-[85%] rounded-full flex items-center justify-center shadow-sm border"
                               style={{ 
                                  backgroundColor: preset.color,
                                  borderColor: 'transparent'
                               }}
                           >
                              <div className="scale-[1.6]">
                                   <FaceIcon 
                                     type={preset.faceType} 
                                     className="w-3 h-3 text-white/90" 
                                   />
                              </div>
                           </div>
                       </button>
                   ))}
              </div>
           </div>

           {/* Name Input */}
           <div className="mb-6">
               <div className="flex justify-between mb-1.5">
                   <label className="text-muted-foreground text-xs font-bold">Display Name</label>
                   <span className="text-muted-foreground text-xs font-bold">
                       <span className="text-primary">{displayName.length}</span>/20
                   </span>
               </div>
               <input 
                 type="text" 
                 value={displayName}
                 onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                 className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground font-bold focus:outline-none focus:border-primary transition-colors placeholder-muted-foreground"
                 placeholder="Enter display name"
               />
           </div>

           {/* Footer Buttons */}
           <div className="flex gap-3">
               <button 
                 onClick={onClose}
                 className="flex-1 bg-secondary hover:bg-accent text-secondary-foreground font-bold py-3 rounded-full transition-colors"
               >
                   Cancel
               </button>
               <button 
                 onClick={handleSave}
                 disabled={isLoading}
                 className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-full transition-colors flex items-center justify-center"
               >
                   {isLoading ? 'Saving...' : 'Save'}
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
