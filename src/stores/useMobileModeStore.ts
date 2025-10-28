import { create } from 'zustand';

interface MobileModeStore {
  /**
   * 모바일 모드인지 여부
   * (화면 크기가 모바일 크기일 때 true)
   */
  isMobileMode: boolean;

  /**
   * 모바일 모드 설정
   */
  setMobileMode: (isMobile: boolean) => void;
}

/**
 * 모바일 모드 상태를 전역으로 관리하는 Zustand Store
 *
 * 새로고침 시 초기화되지만, MenuMobile 컴포넌트가 마운트되면
 * 즉시 checkMobile()이 실행되어 현재 화면 크기를 감지하므로 문제없음
 *
 * 사용법:
 * ```tsx
 * // MenuMobile 컴포넌트에서 (상태 업데이트)
 * const { setMobileMode } = useMobileModeStore();
 *
 * useEffect(() => {
 *   const checkMobile = () => {
 *     const isMobile = window.innerWidth < 768; // md breakpoint
 *     setMobileMode(isMobile);
 *   };
 *
 *   checkMobile();
 *   window.addEventListener('resize', checkMobile);
 *   return () => window.removeEventListener('resize', checkMobile);
 * }, [setMobileMode]);
 *
 * // LayoutHeader에서 (상태 읽기)
 * const { isMobileMode } = useMobileModeStore();
 *
 * if (isMobileMode) {
 *   // 모바일 모드일 때의 레이아웃
 * }
 * ```
 */
export const useMobileModeStore = create<MobileModeStore>((set) => ({
  isMobileMode: false,
  setMobileMode: (isMobile: boolean) => set({ isMobileMode: isMobile }),
}));
