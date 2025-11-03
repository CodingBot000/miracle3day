import React from 'react';
import { LayoutGrid, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ViewToggleProps {
  currentView: 'card' | 'timeline';
  onViewChange: (view: 'card' | 'timeline') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex justify-center mt-6">
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <Button
          variant={currentView === 'card' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('card')}
          className={`
            flex items-center space-x-2 px-4 py-2
            ${currentView === 'card'
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Card View</span>
        </Button>
        <Button
          variant={currentView === 'timeline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('timeline')}
          className={`
            flex items-center space-x-2 px-4 py-2
            ${currentView === 'timeline'
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <Calendar className="w-4 h-4" />
          <span>Timeline View</span>
        </Button>
      </div>
    </div>
  );
};

export default ViewToggle;
