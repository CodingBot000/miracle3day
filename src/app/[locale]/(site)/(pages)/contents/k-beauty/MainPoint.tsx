import ImageWithCaption from './ImageWithCaption';
import { KBeautyMainPoint } from '@/types/kBeauty';

interface Props {
  point: KBeautyMainPoint;
  sectionKey: string;
  isFirst?: boolean;
}

export default function MainPoint({ point, sectionKey, isFirst }: Props) {
  if (!point) return null;

  return (
    <div className={`${isFirst ? '' : 'border-t border-gray-200 pt-16'}`}>
      {/* Title */}
      {point.title && (
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
            {point.title}
          </h2>
          {point.subtitle && (
            <p className="text-xl text-gray-600 italic" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
              {point.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Image */}
      {point.image && (
        <ImageWithCaption
          src={point.image}
          alt={point.title || 'K-Beauty'}
          aspectRatio="video"
        />
      )}

      {/* Content */}
      {point.content && Array.isArray(point.content) && point.content.length > 0 && (
        <div className="mt-8 space-y-4">
          {point.content.map((text, idx) => (
            text && typeof text === 'string' && (
              <p
                key={idx}
                className="text-gray-700 leading-relaxed text-lg"
                style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}
                dangerouslySetInnerHTML={{
                  __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
                }}
              />
            )
          ))}
        </div>
      )}

      {/* Ten Steps (if exists) */}
      {point.tenSteps && Array.isArray(point.tenSteps) && point.tenSteps.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">10단계 루틴</h3>
          <ol className="space-y-3">
            {point.tenSteps.map((step, idx) => (
              <li key={idx} className="text-gray-700 leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Stats (if exists) */}
      {point.stats && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(point.stats).map(([key, stat]) => {
            const isObject = typeof stat === 'object' && 'value' in stat;
            const value = isObject ? stat.value : stat;
            const label = isObject ? stat.label : key;

            return (
              <div key={key} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {value}
                </div>
                <div className="text-sm text-gray-600">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
