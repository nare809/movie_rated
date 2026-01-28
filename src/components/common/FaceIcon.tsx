

const FaceIcon = ({ type = 0, className = "w-full h-full" }: { type?: number, className?: string }) => {
  const renderFeatures = () => {
    switch (type) {
      case 1: // Surprise (Yellow)
        return (
          <>
            <circle cx="7.5" cy="9" r="2.5" fill="currentColor" />
            <circle cx="16.5" cy="9" r="2.5" fill="currentColor" />
            <circle cx="12" cy="16" r="4" stroke="currentColor" strokeWidth="3" />
          </>
        );
      case 2: // Squiggly (Purple)
        return (
          <>
             <circle cx="7.5" cy="9" r="2.5" fill="currentColor" />
             <circle cx="16.5" cy="9" r="2.5" fill="currentColor" />
             <path d="M7 16C9 13.5 11 18.5 12 16C13 13.5 15 18.5 17 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </>
        );
      case 3: // Wink (Green)
        return (
           <>
             <circle cx="7" cy="9" r="2.5" fill="currentColor" />
             <path d="M13.5 9L18.5 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
             <path d="M16 16C16 16 14 18.5 12 18.5C10 18.5 8 16 8 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
           </>
        );
      case 4: // Dead (Blue)
        return (
           <>
             <path d="M5 6L10 11M10 6L5 11" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
             <path d="M14 6L19 11M19 6L14 11" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
             <path d="M7 16.5L17 16.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
           </>
        );
      case 5: // Starry (Orange)
         return (
           <>
             <path d="M6.5 5.5V11.5" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
             <path d="M17.5 5.5V11.5" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
             <path d="M7 16Q12 22 17 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
           </>
         );
      case 0: // Smile (Pink) - Default
      default:
        return (
          <>
            <circle cx="6.5" cy="8.5" r="3" fill="currentColor" />
            <circle cx="17.5" cy="8.5" r="3" fill="currentColor" />
            <path d="M18 16C18 16 15.5 19.5 12 19.5C8.5 19.5 6 16 6 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </>
        );
    }
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {renderFeatures()}
    </svg>
  );
};

export default FaceIcon;
