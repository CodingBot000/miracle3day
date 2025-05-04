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


const languageOptions = [
  { label: "English", code: "en-US" },
  { label: "日本語", code: "ja-JP" },
  { label: "繁體中文(台灣)", code: "zh-TW" },
  { label: "繁體中文(香港)", code: "zh-HK" },
  { label: "ภาษาไทย", code: "th-TH" },
  { label: "Tiếng Việt", code: "vi-VN" },
  { label: "Français", code: "fr-FR" },
  { label: "Español", code: "es-ES" },
  { label: "Deutsch", code: "de-DE" },
  { label: "Italiano", code: "it-IT" },
  { label: "Монгол хэл", code: "mn-MN" },
  { label: "Русский", code: "ru-RU" },
  { label: "Bahasa Indonesia", code: "id-ID" },
  { label: "简体中文", code: "zh-CN" }
];

export const LanguageDropdown = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);

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
        {languageOptions.map((option) => (
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
