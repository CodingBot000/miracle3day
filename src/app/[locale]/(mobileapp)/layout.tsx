/**
 * Mobile App Layout
 *
 * 모바일 앱 전용 레이아웃
 * - fixed 포지셔닝으로 상위 layout 영향 차단
 * - 내부 page는 w-full h-full로 채우기만 하면 됨
 */
export default function MobileAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 overflow-hidden">
      {children}
    </div>
  );
}
