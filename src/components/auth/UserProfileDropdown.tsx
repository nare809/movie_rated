import { useState, useRef, useEffect, type FC } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAvatarConfig } from '../../utils/avatars';

import FaceIcon from '../common/FaceIcon';

interface UserProfileDropdownProps {
  onEditProfile: () => void;
}

const UserProfileDropdown: FC<UserProfileDropdownProps> = ({ onEditProfile }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const namePart = user.email?.split('@')[0] || "Aww User";
  const idPart = user.uid.slice(0, 6).toUpperCase();
  const avatarConfig = getAvatarConfig(user.photoURL);

  return (
    <div className="relative" ref={dropdownRef}>
        {/* Trigger Avatar */}
        <button 
           onClick={() => setIsOpen(!isOpen)}
           className={`w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-transform border overflow-hidden group ${avatarConfig.id === 'pink_smile' ? 'bg-pink-500/20 border-pink-500/30' : ''}`}
           style={{ 
              backgroundColor: avatarConfig.id === 'pink_smile' ? undefined : avatarConfig.color,
              borderColor: avatarConfig.id === 'pink_smile' ? undefined : 'transparent'
           }}
        >
             {user.photoURL && !user.photoURL.startsWith('avatar:') ? (
                 <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
                  <div className="scale-125">
                    <FaceIcon 
                      type={avatarConfig.faceType} 
                      className={`w-5 h-5 ${avatarConfig.id === 'pink_smile' ? 'text-pink-500' : 'text-white/90'}`} 
                    />
                  </div>
             )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 border border-border z-50">
                
                {/* Header */}
                <div className="p-5 flex items-center gap-4 border-b border-border">
                    <div 
                      className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center overflow-hidden border ${avatarConfig.id === 'pink_smile' ? 'bg-pink-500/20 border-pink-500/30' : ''}`}
                      style={{ 
                         backgroundColor: avatarConfig.id === 'pink_smile' ? undefined : avatarConfig.color,
                         borderColor: avatarConfig.id === 'pink_smile' ? undefined : 'transparent'
                      }}
                    >
                        {user.photoURL && !user.photoURL.startsWith('avatar:') ? (
                           <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           <div className="scale-[1.4]">
                              <FaceIcon 
                                 type={avatarConfig.faceType} 
                                 className={`w-6 h-6 ${avatarConfig.id === 'pink_smile' ? 'text-pink-500' : 'text-white/90'}`} 
                              />
                           </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="text-foreground font-bold text-base truncate flex items-center gap-1">
                           <span className="truncate">{namePart}</span>
                           <span className="text-muted-foreground/80 text-xs font-normal">#{idPart}</span>
                        </div>
                        <div className="text-muted-foreground text-[10px] font-bold tracking-widest mt-0.5">LEVEL 1</div>
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="p-2">
                    <div className="mb-2">
                        <div className="px-3 py-2 text-muted-foreground text-xs font-medium">Your activity</div>
                        <button 
                            onClick={() => { setIsOpen(false); navigate('/my-favourites'); }}
                            className="w-full text-left px-3 py-2 text-foreground font-bold text-sm hover:bg-secondary rounded-lg transition-colors"
                        >
                            My Favourites
                        </button>
                        <button 
                            onClick={() => { setIsOpen(false); navigate('/my-list'); }}
                            className="w-full text-left px-3 py-2 text-foreground font-bold text-sm hover:bg-secondary rounded-lg transition-colors"
                        >
                            My List
                        </button>
                        <button 
                            onClick={() => { setIsOpen(false); onEditProfile(); }}
                            className="w-full text-left px-3 py-2 text-foreground font-bold text-sm hover:bg-secondary rounded-lg transition-colors"
                        >
                            Profile Edit
                        </button>
                    </div>
                    
                    <div className="border-t border-border mt-2 pt-2">
                        <button 
                             onClick={handleLogout}
                             className="w-full text-left px-3 py-2 text-foreground font-bold text-sm hover:bg-destructive/10 rounded-lg transition-colors text-destructive hover:text-destructive"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

            </div>
        )}
    </div>
  );
};

export default UserProfileDropdown;
