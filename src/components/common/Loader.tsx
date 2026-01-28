import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <span className="text-gray-400 text-sm font-bold animate-pulse">Loading...</span>
    </div>
  );
};

export default Loader;
