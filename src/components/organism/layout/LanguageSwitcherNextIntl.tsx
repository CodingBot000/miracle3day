"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import { usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useNavigation } from "@/hooks/useNavigation";
import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { locales, type Locale } from "@/i18n/routing";

interface LanguageSwitcherProps {
  iconColor?: 'white' | 'black';
}

const languageLabels: Record<Locale, string> = {
  'en': 'English',
  'ko': '한국어',
  'ja': '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

export const LanguageSwitcherNextIntl = ({ iconColor = 'black' }: LanguageSwitcherProps) => {
  const locale = useLocale();
  const { navigate } = useNavigation();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      navigate(pathname, { replace: true, locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="bg-transparent border-none p-0 m-0 outline-none flex items-center justify-center"
          aria-busy={isPending}
        >
          <Image
            src="/icons/globe_language.svg"
            alt="Select Language"
            width={24}
            height={24}
            className={cn(
              "cursor-pointer transition-all duration-300 ease-in-out hover:opacity-70 w-4 h-4 md:w-6 md:h-6",
              iconColor === 'white' ? 'brightness-0 invert' : '',
              isPending && 'opacity-50'
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[120px] md:w-[150px] z-[250] text-xs md:text-sm">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={cn(
              "flex items-center gap-1 md:gap-2 cursor-pointer text-xs md:text-sm py-1 md:py-2",
              loc === locale && "bg-muted text-primary font-semibold"
            )}
          >
            {loc === locale && <Check className="w-3 h-3 md:w-4 md:h-4" />}
            {languageLabels[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcherNextIntl;
