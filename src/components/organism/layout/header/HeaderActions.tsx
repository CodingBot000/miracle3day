"use client";

import { Link } from "@/i18n/routing";
import { MessageSquareText } from "lucide-react";
import { VscRobot } from "react-icons/vsc";
import LanguageSwitcherNextIntl from "../LanguageSwitcherNextIntl";
import AuthClient from "@/components/molecules/auth/AuthClient";
import { SearchButton } from "@/components/search/SearchButton";
import { useNavigation } from "@/hooks/useNavigation";

interface HeaderActionsProps {
  /** 아이콘 색상 ('white' | 'black') */
  iconColor?: 'white' | 'black';
  /** 모바일 모드 여부 (커뮤니티 아이콘 표시 제어) */
  isMobileMode?: boolean;
}

/**
 * 헤더의 우측 아이콘들 (커뮤니티, 언어 변경, 인증)
 * - LayoutHeaderHome: 스크롤에 따라 색상 변경
 * - LayoutHeaderBase/Normal: 항상 검은색
 */
export default function HeaderActions({
  iconColor = 'black',
  isMobileMode = false
}: HeaderActionsProps) {
  const { navigate } = useNavigation();

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 transition-colors duration-300 ${
        iconColor === 'white' ? 'text-white' : 'text-black'
      }`}>
        {/* Search button */}
        <SearchButton iconColor={iconColor === 'white' ? 'white' : 'currentColor'} />

        {/* AI Agent button */}
        <button
          onClick={() => navigate('/ai-agent')}
          className="flex items-center hover:opacity-70 transition-opacity"
          aria-label="AI Beauty Consultation"
        >
          <VscRobot size={20} />
        </button>

        {/* community */}
        {!isMobileMode && (
          <Link href="/community" className="flex items-center">
            <MessageSquareText size={20} />
          </Link>
        )}

        <div className="flex items-center">
          <LanguageSwitcherNextIntl iconColor={iconColor} />
        </div>
      </div>

      {!isMobileMode && (
        <div className="relative text-black flex items-center">
          <AuthClient iconColor={iconColor} />
        </div>
      )}
    </div>
  );
}
