import LayoutHeaderBase from '@/components/organism/layout/header/LayoutHeaderBase';
import { PropsWithChildren } from 'react';

/**
 * Chat-specific layout
 * - Excludes MenuMobile (bottom navigation bar hidden)
 * - Provides minimal UI for focused chat experience
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
