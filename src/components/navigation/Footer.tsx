import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
         
         {/* Links */}
         <div className="flex items-center justify-center space-x-8 mb-8">
            <Link to="/" className="text-muted-foreground font-bold hover:text-foreground transition-colors border-b border-foreground pb-1">About</Link>
            <Link to="/" className="text-muted-foreground font-bold hover:text-foreground transition-colors border-b border-foreground pb-1">Privacy Policy</Link>
            <Link to="/" className="text-muted-foreground font-bold hover:text-foreground transition-colors border-b border-foreground pb-1">Terms of Service</Link>
            <Link to="/" className="text-muted-foreground font-bold hover:text-foreground transition-colors border-b border-foreground pb-1">Contact Us</Link>
         </div>

         {/* Disclaimer Text (Replaces Social Icons) */}
         <div className="max-w-2xl mx-auto mb-8">
            <p className="text-muted-foreground/60 text-sm font-bold leading-relaxed">
               This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
            </p>
         </div>

         {/* Copyright */}
         <div className="text-muted-foreground/40 font-bold text-sm mb-8">
            Copyright © VidPlay, Inc.
         </div>

         {/* Bottom Logo */}
         <div className="flex justify-center">
            <div className="relative">
               <div className="w-8 h-8 flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-primary fill-current animate-pulse" />
               </div>
            </div>
         </div>

      </div>
    </footer>
  );
};

export default Footer;
