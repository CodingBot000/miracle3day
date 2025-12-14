import LayoutHeaderBase from '@/components/organism/layout/header/LayoutHeaderBase';
import { PropsWithChildren } from 'react';

/**
 * Chat 전용 레이아웃
 * - MenuMobile 제외 (하단 네비게이션 바 숨김)
 * - 채팅에 집중할 수 있도록 최소한의 UI만 제공
 */
export default function ChatLayout({ children }: PropsWithChildren) {
  return (
  <>
      <LayoutHeaderBase />
      <div className="fixed top-[88px] bottom-0 left-0 right-0 w-full overflow-hidden">
        {children}
      </div>
  </>
  );
}
