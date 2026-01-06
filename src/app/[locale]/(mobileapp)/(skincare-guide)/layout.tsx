/**
 * Skincare Guide Layout (without BottomNavigation)
 *
 * 스킨케어 가이드 전용 레이아웃 - 하단 네비게이션 없음
 */
export default function SkincareGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto">
      {children}
    </div>
  );
}
