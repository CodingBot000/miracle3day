"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
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
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="bg-transparent border-none p-0 m-0 outline-none"
          aria-busy={isPending}
        >
          <Image
            src="/icons/globe_language.svg"
            alt="Select Language"
            width={24}
            height={24}
            className={cn(
              "cursor-pointer transition-all duration-300 ease-in-out hover:opacity-70",
              iconColor === 'white' ? 'brightness-0 invert' : '',
              isPending && 'opacity-50'
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px] z-[250]">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              loc === locale && "bg-muted text-primary font-semibold"
            )}
          >
            {loc === locale && <Check className="w-4 h-4" />}
            {languageLabels[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcherNextIntl;
