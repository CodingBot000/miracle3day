import ImageWithCaption from './ImageWithCaption';
import { KBeautyConclusion } from '@/types/kBeauty';

interface Props {
  conclusion?: KBeautyConclusion | { title: string; quote: string; points: string[]; closingLine: string; image: string };
  sectionKey: string;
}

export default function Conclusion({ conclusion, sectionKey }: Props) {
  if (!conclusion || !conclusion.title) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-gray-200 pt-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
        {conclusion.title}
      </h2>

      {/* Quote */}
      {conclusion.quote && (
        <blockquote className="my-12 py-8 px-8 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 rounded-r-2xl">
          <p
            className="text-2xl md:text-3xl font-light text-gray-800 italic leading-relaxed"
            style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}
            dangerouslySetInnerHTML={{
              __html: conclusion.quote.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold not-italic">$1</strong>')
            }}
          />
        </blockquote>
      )}

      {/* Points */}
      {conclusion.points && conclusion.points.length > 0 && (
        <div className="my-8 space-y-3">
          {conclusion.points.map((point, idx) => (
            <p key={idx} className="text-lg text-gray-700 leading-relaxed pl-6" style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}>
              {point}
            </p>
          ))}
        </div>
      )}

      {/* Image */}
      {conclusion.image && (
        <ImageWithCaption
          src={conclusion.image}
          alt="Conclusion"
          aspectRatio="video"
        />
      )}

      {/* Closing Line */}
      {conclusion.closingLine && (
        <p className="mt-8 text-xl text-gray-800 font-medium text-center leading-relaxed">
          {conclusion.closingLine}
        </p>
      )}
    </section>
  );
}
