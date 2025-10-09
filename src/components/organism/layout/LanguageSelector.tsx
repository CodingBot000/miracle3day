"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { translateLanguage } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  // Map language codes to simplified format
  const languageCodeMap: Record<string, 'ko' | 'en'> = {
    'ko-KR': 'ko',
    'en-US': 'en',
  };

  const reverseLanguageMap: Record<string, string> = {
    'ko': 'ko-KR',
    'en': 'en-US',
  };

  const selectedCode = reverseLanguageMap[language] || 'en-US';

  const handleLanguageChange = (code: string) => {
    const simplifiedCode = languageCodeMap[code];
    if (simplifiedCode) {
      setLanguage(simplifiedCode);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src="/icons/globe_language.svg"
          alt="Select Language"
          width={24}
          height={24}
          className="cursor-pointer transition-opacity duration-200 ease-in-out hover:opacity-70"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px] z-[250]">
        {translateLanguage.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              option.code === selectedCode &&
                "bg-muted text-primary font-semibold"
            )}
          >
            {option.code === selectedCode && (
              <Check className="w-4 h-4" />
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
