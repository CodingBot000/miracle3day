import BottomNavigation from "../components/BottomNavigation";

/**
 * Main Layout (with BottomNavigation)
 *
 * 하단 네비게이션이 필요한 메인 페이지들용 레이아웃
 * - h-full로 부모 높이 채우기
 * - 스크롤 영역은 calc()로 BottomNav 높이 제외
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}
