"use client";
import React from "react";
import { FiVideo } from "react-icons/fi";
import { useNavigation } from "@/hooks/useNavigation";

interface ConsultationButtonProps {
  reservationId: string;
  role?: "doctor" | "patient";
  userName?: string;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}

/**
 * Button component to join a video consultation
 * Can be used in reservation lists, detail pages, etc.
 */
export default function ConsultationButton({
  reservationId,
  role = "patient",
  userName,
  disabled = false,
  className = "",
  variant = "primary"
}: ConsultationButtonProps) {
  const { navigate } = useNavigation();

  const handleJoinConsultation = () => {
    const query = new URLSearchParams();
    query.set("role", role);
    if (userName) query.set("name", userName);

    navigate(`/mobile/consult/${reservationId}?${query.toString()}`);
  };

  const baseClasses = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline: "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500"
  };

  return (
    <button
      onClick={handleJoinConsultation}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <FiVideo className="w-5 h-5" />
      <span>Join Consultation</span>
    </button>
  );
}
