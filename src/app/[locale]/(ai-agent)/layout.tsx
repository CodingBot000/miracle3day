/**
 * AI Agent Layout
 *
 * AI Agent 전용 독립 레이아웃
 * - 풀스크린 채팅 UI에 최적화
 * - 네비게이션/사이드바 없음
 */
export default function AIAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {children}
    </div>
  );
}
