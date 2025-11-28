import React from 'react';
import { MapPin, Share2, MessageCircle, ArrowRight } from 'lucide-react';

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
    <div className="mt-10 space-y-6">
      {/* Primary action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Find Clinics */}
        <button
          onClick={onFindClinics}
          className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
        >
          <MapPin className="w-5 h-5" />
          <span>Find Clinics</span>
          <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
        </button>

        {/* Share Results */}
        <button
          onClick={onShare}
          className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-700 font-semibold rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <Share2 className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          <span>Share Results</span>
        </button>

        {/* Book Consultation */}
        <button
          onClick={onConsult}
          className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 transition-all duration-300 hover:-translate-y-0.5"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Book Consultation</span>
          <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
        </button>
      </div>

      {/* Additional info */}
      <div className="text-center px-6 py-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
        <p className="text-sm text-gray-600 leading-relaxed">
          Ready to start your journey? Find qualified clinics near you or book a consultation to discuss your personalized treatment plan.
        </p>
      </div>
    </div>
  );
};

export default ActionButtons;
