"use client"

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  iconColor?: 'white' | 'black';
}

const BackButton = ({ iconColor = 'black' }: BackButtonProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 transition-colors duration-300 ${
        iconColor === 'white' ? 'text-white' : 'text-black'
      }`}
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
      {/* <span className="text-sm font-medium">Back</span> */}
    </button>
  );
};

export default BackButton;
