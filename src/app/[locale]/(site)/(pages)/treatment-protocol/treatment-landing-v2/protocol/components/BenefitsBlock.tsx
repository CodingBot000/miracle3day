import type { Benefits, Locale } from "@/models/treatmentData.dto";

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

type BenefitsProps = {
  benefits: Benefits | null | undefined;
  locale: Locale;
};

const defaultEmojis = ["✨", "💫", "🌟", "💎", "🌸", "🌼"];

export function BenefitsBlock({ benefits, locale }: BenefitsProps) {
  if (!benefits) {
    return null;
  }

  const inputs = Array.isArray(benefits.inputs) ? benefits.inputs : [];
  const result = benefits.result;
  const resultText = pickLocale(result?.title, locale);
  const hasInputs = inputs.length > 0;

  if (!hasInputs && !resultText) {
    return (
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-3 text-xs text-[#8b7266] shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-4 md:text-sm">
        No benefits available.
        {/* {locale === "ko"
          ? "등록된 효과 정보가 없습니다."
          : "No benefits available."} */}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-3 shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-4">
      <div className="border-l-4 border-[#d4a59a] pl-3">
        <h3 className="text-base font-semibold text-[#6b4e44] md:text-lg">
          {locale === "ko" ? "효과 & 결과" : "Benefits & Result"}
        </h3>
        <p className="text-[10px] text-[#8b7266] md:text-xs">
          {locale === "ko"
            ? "어떤 변화를 기대할 수 있을까요?"
            : "What positive changes to expect"}
        </p>
      </div>

      <div className="mt-3 space-y-1">
        {hasInputs && (
          <div className="grid gap-2 md:grid-cols-2">
            {inputs.map((input, index) => {
              const emoji =
                (input.meta && typeof input.meta.emoji === "string"
                  ? input.meta.emoji
                  : undefined) ?? defaultEmojis[index % defaultEmojis.length];

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-white/60 bg-white/70 p-2.5 shadow-[0_14px_30px_rgba(212,165,154,0.16)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:p-3"
                >
                  <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-[#d4a59a]/20 blur-2xl" />
                  <div className="flex items-center gap-2">
                    <span className="text-xl drop-shadow-sm md:text-2xl">{emoji}</span>
                    <p className="text-sm font-semibold text-[#6b4e44] md:text-base">
                      {pickLocale(input.title, locale)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center py-0.5 text-xl text-[#d4a59a] drop-shadow-sm md:text-4xl">
          ↓
        </div>

        <div className="rounded-xl border border-white/60 bg-white/70 p-3 text-center shadow-[0_18px_36px_rgba(212,165,154,0.2)] backdrop-blur-xl md:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a88f84] md:text-xs">
            {locale === "ko" ? "결과" : "Result"}
          </p>
          <p className="mt-1 text-base font-semibold text-[#6b4e44] md:text-lg">
            {resultText}
          </p>
          {result?.meta?.description && (
            <p className="mt-1 text-[10px] text-[#8b7266] md:text-xs">
              {String(result.meta.description)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
