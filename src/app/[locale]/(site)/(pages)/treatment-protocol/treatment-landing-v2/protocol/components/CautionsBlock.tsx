import type { Locale, LocalizedText } from "@/models/treatmentData.dto";

function pickLocale<T extends { ko?: string | null; en?: string | null }>(
  value: T | undefined,
  locale: Locale
): string {
  if (!value) {
    return "";
  }

  return locale === "ko"
    ? value.ko ?? value.en ?? ""
    : value.en ?? value.ko ?? "";
}

type CautionsProps = {
  cautions: LocalizedText | null | undefined;
  locale: Locale;
};

export function CautionsBlock({ cautions, locale }: CautionsProps) {
  const text = pickLocale(cautions ?? undefined, locale).trim();

  if (!text) {
    return (
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-3 text-xs text-[#8b7266] shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-4 md:text-sm">
        {locale === "ko"
          ? "등록된 주의사항이 없습니다."
          : "No cautions available."}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-3 shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-4">
      <div className="border-l-4 border-[#d4a59a] pl-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#a88f84] md:text-xs">
          {locale === "ko" ? "Important Notes" : "Important Notes"}
        </p>
        <h3 className="text-base font-semibold text-[#6b4e44] md:text-lg">
          {locale === "ko" ? "주의사항" : "Cautions"}
        </h3>
        <p className="text-[10px] text-[#8b7266] md:text-xs">
          {locale === "ko"
            ? "시술 전 꼭 확인해주세요"
            : "Please review before the treatment"}
        </p>
      </div>

      <div className="mt-2 flex gap-2">
        <span className="text-xl drop-shadow-sm md:text-2xl">⚠️</span>
        <p className="text-xs leading-relaxed text-[#8b7266] md:text-sm">
          {text}
        </p>
      </div>
    </div>
  );
}
