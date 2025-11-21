
import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved';

interface AutosaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ status, className }) => {
  const baseClasses = "flex items-center text-sm transition-all duration-300";
  
  if (status === 'saving') {
    return (
      <div className={`${baseClasses} text-gray-500 ${className}`}>
        <Loader2 size={16} className="animate-spin mr-2" />
        Saving...
      </div>
    );
  }
  
  if (status === 'saved') {
    return (
      <div className={`${baseClasses} text-green-600 ${className}`}>
        <CheckCircle size={16} className="mr-2" />
        Changes saved
      </div>
    );
  }

  // idle
  return (
    <div className={`${baseClasses} text-gray-400 ${className}`}>
      <CheckCircle size={16} className="mr-2" />
      <span>Autosave is active</span>
    </div>
  );
};
export default AutosaveIndicator;
