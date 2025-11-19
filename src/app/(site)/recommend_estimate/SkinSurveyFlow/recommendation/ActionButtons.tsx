import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Share2, MessageCircle } from 'lucide-react';

export interface ActionButtonsProps {
  onFindClinics?: () => void;
  onShare?: () => void;
  onConsult?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onFindClinics,
  onShare,
  onConsult,
}) => {
  return (
    <div className="mt-8 space-y-4">
      {/* Primary action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Find Clinics */}
        <Button
          onClick={onFindClinics}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-14"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Find Nearby Clinics
        </Button>

        {/* Share Results */}
        <Button
          onClick={onShare}
          variant="outline"
          className="border-2 border-gray-300 hover:border-gray-400 h-14"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Results
        </Button>

        {/* Book Consultation */}
        <Button
          onClick={onConsult}
          className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white h-14"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Book Consultation
        </Button>
      </div>

      {/* Additional info */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Ready to start your journey? Find qualified clinics near you or book a consultation to discuss your personalized treatment plan.
        </p>
      </div>
    </div>
  );
};

export default ActionButtons;
