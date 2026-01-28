

import { LayoutGrid } from 'lucide-react';

const SectionHeader = ({ title, tabs, noUnderline, onTabClick }: { title: string, tabs?: string[], noUnderline?: boolean, onTabClick?: (tab: string) => void }) => {
  return (
    <div className={`flex items-end justify-between mb-6 ${noUnderline ? '' : 'border-b border-black/10 dark:border-white/10'} pb-2`}>
      <div className="flex items-center space-x-2">
        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
      </div>
      
      {tabs && (
        <div className="flex space-x-4">
          {tabs.map((tab, idx) => (
             tab === 'Playlist' ? (
               <button 
                 key={tab} 
                 onClick={() => onTabClick?.(tab)}
                 className="flex items-center bg-secondary hover:bg-accent px-4 py-2 rounded-xl transition-all duration-300 group cursor-pointer hover:scale-105 active:scale-95"
               >
                 <LayoutGrid className="w-5 h-5 text-primary mr-2 fill-current transition-colors" />
                 <span className="text-foreground font-bold text-sm tracking-wide">{tab}</span>
               </button>
             ) : (
               <button 
                 key={tab} 
                 onClick={() => onTabClick?.(tab)}
                 className={`text-sm font-bold pb-2 border-b-2 transition-colors ${idx === 0 ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
               >
                 {tab}
               </button>
             )
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
