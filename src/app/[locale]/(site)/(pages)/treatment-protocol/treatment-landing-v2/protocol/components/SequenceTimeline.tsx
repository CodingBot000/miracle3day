import type { Locale, SequenceStep, SequenceTitle } from "@/models/treatmentData.dto";

function getTitleByLocale(title: SequenceTitle, locale: Locale): string {
  if (locale === "ko") return title.ko ?? title.en ?? "";
  return title.en ?? title.ko ?? "";
}

type SequenceTimelineProps = {
  steps: SequenceStep[];
  locale: Locale;
  stepCount?: number;
};

export function SequenceTimeline({ steps, locale, stepCount }: SequenceTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const showStepNumber = sortedSteps.length > 1;

  if (!sortedSteps.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-white/75 via-white/65 to-white/55 p-3 shadow-[0_18px_40px_rgba(212,165,154,0.18)] backdrop-blur-xl md:p-4">
      <div className="border-l-4 border-[#d4a59a] pl-3">
        <h3 className="text-base font-semibold text-[#6b4e44] md:text-lg">
          {locale === "ko" ? "시술 순서" : "Treatment Plan"}
        </h3>
      </div>

      <ol className="mt-3 space-y-2">
        {sortedSteps.map((step, index) => {
          const waitMin = step.timing?.waitMinDays ?? null;
          const waitMax = step.timing?.waitMaxDays ?? null;
          const hasWaitInfo = waitMin !== null || waitMax !== null;

          return (
            <li key={step.order}>
              <div className="flex gap-2 rounded-xl border border-white/60 bg-white/70 p-2.5 shadow-[0_16px_30px_rgba(212,165,154,0.16)] backdrop-blur-xl md:gap-3 md:p-3">
                {showStepNumber && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-white/70 bg-[#d4a59a] text-xs font-semibold text-white shadow-[0_8px_16px_rgba(212,165,154,0.35)] md:h-7 md:w-7 md:text-sm">
                    {index + 1}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="text-sm font-semibold text-[#6b4e44] md:text-base">
                      {getTitleByLocale(step.title, locale)}
                    </p>
                    {step.timing?.afterWeeks && (
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-[#a88f84] shadow-inner md:text-xs">
                        {locale === "ko"
                          ? `${step.timing.afterWeeks}주 후`
                          : `~${step.timing.afterWeeks} weeks later`}
                      </span>
                    )}
                  </div>

                  {hasWaitInfo && (
                    <p className="text-[10px] text-[#a88f84] md:text-xs">
                      {locale === "ko"
                        ? `다음 단계까지 ${waitMin ?? ""}${
                            waitMax !== null ? `~${waitMax}` : ""
                          }일`
                        : `Wait ${waitMin ?? ""}${
                            waitMax !== null ? `~${waitMax}` : ""
                          } days`}
                    </p>
                  )}

                  {step.note && (
                    <p className="text-xs leading-relaxed text-[#8b7266] md:text-sm">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
