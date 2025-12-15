import { KBeautyIntro, KBeautyMainPoint, KBeautyStatistics, KBeautyConclusion, KBeautyCTA } from '@/types/kBeauty';
import MainPoint from './MainPoint';
import Statistics from './Statistics';
import Conclusion from './Conclusion';
import CTAButton from './CTAButton';
import { ROUTE } from '@/router';

interface Props {
  sectionKey: string;
  intro?: KBeautyIntro | Record<string, never>;
  mainPoints?: Record<string, KBeautyMainPoint> | Record<string, never>;
  statistics?: KBeautyStatistics;
  conclusion?: KBeautyConclusion | { title: string; quote: string; points: string[]; closingLine: string; image: string };
  cta?: KBeautyCTA;
}

export default function SectionContent({
  sectionKey,
  intro,
  mainPoints,
  statistics,
  conclusion,
  cta,
}: Props) {
  return (
    <article className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-12 pb-8 lg:pb-12 max-w-5xl" style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}>
      {/* Introduction */}
      <div className="prose prose-lg max-w-none mb-8">
        {intro && Object.values(intro).map((paragraph, idx) => (
          paragraph && typeof paragraph === 'string' && (
            <p
              key={idx}
              className="text-gray-700 leading-relaxed mb-2 text-lg"
              style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}
              dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>') }}
            />
          )
        ))}
      </div>

      {/* Main Points */}
      {mainPoints && Object.keys(mainPoints).length > 0 && (
        <div className="space-y-20 mb-20">
          {Object.entries(mainPoints).map(([key, point]) => (
            <MainPoint
              key={key}
              point={point}
              sectionKey={sectionKey}
              isFirst={key === 'point1'}
            />
          ))}
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <Statistics
          title={statistics.title}
          data={statistics.data}
          image={statistics.image}
        />
      )}

      {/* Conclusion */}
      <Conclusion
        conclusion={conclusion}
        sectionKey={sectionKey}
      />

      {/* CTA */}
      {cta && cta.text && (
        <div className="mt-16 mb-20 lg:mb-32 text-center">
          <CTAButton
            text={cta.text}
            link={ROUTE.TREATMENT_PROTOCOL}
          />
        </div>
      )}
    </article>
  );
}
