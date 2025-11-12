export default function BadgeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 레벨 카드 스켈레톤 */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-6 h-40" />

      {/* 획득 배지 스켈레톤 */}
      <div>
        <div className="h-6 w-32 bg-gray-300 rounded mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 h-24 shadow-md" />
          ))}
        </div>
      </div>

      {/* 진행 중 배지 스켈레톤 */}
      <div>
        <div className="h-6 w-40 bg-gray-300 rounded mb-3" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 h-20 shadow-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
