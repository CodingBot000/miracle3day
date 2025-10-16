"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { translateLanguage } from "@/constants";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";

interface LanguageSelectorProps {
  iconColor?: 'white' | 'black';
}

export const LanguageSelector = ({ iconColor = 'black' }: LanguageSelectorProps) => {
  const { language, setLanguage } = useCookieLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const languageCodeMap = useMemo(() => {
    const map: Record<string, 'ko' | 'en'> = {};
    translateLanguage.forEach((option) => {
      const base = option.code.split('-')[0]?.toLowerCase();
      if (base === 'ko' || base === 'en') {
        map[option.code] = base;
        map[base] = base;
      }
    });
    return map;
  }, []);

  const reverseLanguageMap = useMemo(() => {
    const map: Partial<Record<'ko' | 'en', string>> = {};

    translateLanguage.forEach((option) => {
      const base = option.code.split('-')[0]?.toLowerCase();
      if ((base === 'ko' || base === 'en') && !map[base]) {
        map[base] = option.code;
      }
    });

    if (!map.ko) map.ko = 'ko-KR';
    if (!map.en) map.en = 'en-US';

    return map as Record<'ko' | 'en', string>;
  }, []);

  const selectedCode = reverseLanguageMap[language] || translateLanguage[0]?.code || 'en-US';

  const handleLanguageChange = (code: string) => {
    const simplifiedCode = languageCodeMap[code];

    if (!simplifiedCode || simplifiedCode === language) {
      return;
    }

    startTransition(() => {
      setLanguage(simplifiedCode);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src="/icons/globe_language.svg"
          alt="Select Language"
          width={24}
          height={24}
          className={cn(
            "cursor-pointer transition-all duration-300 ease-in-out hover:opacity-70",
            iconColor === 'white' ? 'brightness-0 invert' : ''
          )}
          aria-busy={isPending}
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
