/**
 * Mobile App Layout
 *
 * 모바일 앱 전용 레이아웃
 * - 스크롤은 하위 레이아웃에서 처리
 * - overflow-hidden 중첩 제거하여 DevTools 호환성 확보
 */
export default function MobileAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {children}
    </div>
  );
}
