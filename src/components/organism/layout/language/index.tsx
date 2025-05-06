"use client";

import styles from "./language.module.scss";

import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import clsx from "clsx";
import { Check } from "lucide-react";
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
          className={styles.icon}
          style={{ cursor: "pointer" }}
        />
        {/* <Button variant="outline" className="w-[150px]">
          {selectedLanguage.label}
        </Button> */}
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
            {option.code === selectedLanguage.code && <Check className="w-4 h-4" />}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default LanguageDropdown;
