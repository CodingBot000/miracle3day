"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { languages } from "@/constants";

export const LanguageDropdown = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

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
      <DropdownMenuContent className="w-[150px]">
        {languages.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setSelectedLanguage(option)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              option.code === selectedLanguage.code &&
                "bg-muted text-primary font-semibold"
            )}
          >
            {option.code === selectedLanguage.code && (
              <Check className="w-4 h-4" />
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageDropdown;
