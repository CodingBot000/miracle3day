import BottomNavigation from "../components/BottomNavigation";

/**
 * Main Layout (with BottomNavigation)
 *
 * 하단 네비게이션이 필요한 메인 페이지들용 레이아웃
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomNavigation />
    </>
  );
}
