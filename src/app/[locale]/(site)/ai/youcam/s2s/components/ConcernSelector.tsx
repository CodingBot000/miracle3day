'use client';

import { SkinConcern } from '@/app/api/ai/youcam/lib/types';

interface ConcernSelectorProps {
  mode: 'SD' | 'HD';
  selectedConcerns: SkinConcern[];
  onConcernSelect: (concerns: SkinConcern[]) => void;
}

export default function ConcernSelector({
  mode,
  selectedConcerns,
  onConcernSelect,
}: ConcernSelectorProps) {
  const SD_CONCERNS: { value: SkinConcern; label: string; description: string }[] = [
    { value: 'Wrinkle', label: 'Wrinkles', description: 'Fine lines and wrinkles' },
    { value: 'Droopy_upper_eyelid', label: 'Droopy Eyelids', description: 'Sagging upper eyelids' },
    { value: 'Firmness', label: 'Firmness', description: 'Skin elasticity and firmness' },
    { value: 'Acne', label: 'Acne', description: 'Acne and blemishes' },
    { value: 'Moisture', label: 'Moisture', description: 'Skin hydration levels' },
    { value: 'Eye_bag', label: 'Eye Bags', description: 'Under-eye puffiness' },
    { value: 'Dark_circle', label: 'Dark Circles', description: 'Under-eye darkness' },
    { value: 'Spots', label: 'Age Spots', description: 'Dark spots and pigmentation' },
    { value: 'Radiance', label: 'Radiance', description: 'Skin brightness and glow' },
    { value: 'Redness', label: 'Redness', description: 'Skin redness and irritation' },
    { value: 'Oiliness', label: 'Oiliness', description: 'Excess oil production' },
    { value: 'Pore', label: 'Pores', description: 'Pore visibility and size' },
    { value: 'Texture', label: 'Texture', description: 'Skin smoothness and texture' },
  ];

  const concerns = SD_CONCERNS.map(concern => ({
    ...concern,
    value: mode === 'HD' ? `HD_${concern.value}` as SkinConcern : concern.value,
  }));

  const handleToggleConcern = (concern: SkinConcern) => {
    const isSelected = selectedConcerns.includes(concern);
    let newConcerns: SkinConcern[];

    if (isSelected) {
      newConcerns = selectedConcerns.filter(c => c !== concern);
    } else {
      newConcerns = [...selectedConcerns, concern];
    }

    onConcernSelect(newConcerns);
  };

  const selectPreset = (count: 4 | 7 | 14) => {
    const preset = concerns.slice(0, count).map(c => c.value);
    onConcernSelect(preset);
  };

  const validCounts = [4, 7, 14];
  const isValidSelection = validCounts.includes(selectedConcerns.length);

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Selected: {selectedConcerns.length} concerns
          </span>
          {!isValidSelection && selectedConcerns.length > 0 && (
            <span className="text-sm text-red-600">
              Must select 4, 7, or 14 concerns
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => selectPreset(4)}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Select 4
          </button>
          <button
            onClick={() => selectPreset(7)}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Select 7
          </button>
          <button
            onClick={() => selectPreset(14)}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Select All (14)
          </button>
          <button
            onClick={() => onConcernSelect([])}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
        {concerns.map((concern) => {
          const isSelected = selectedConcerns.includes(concern.value);
          return (
            <div
              key={concern.value}
              onClick={() => handleToggleConcern(concern.value)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {concern.label}
                  </h4>
                  <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {concern.description}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}