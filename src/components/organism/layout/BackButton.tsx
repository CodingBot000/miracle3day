"use client"

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlatform, useWebViewBridge } from "@/hooks/usePlatform";

interface BackButtonProps {
  iconColor?: 'white' | 'black';
}

const BackButton = ({ iconColor = 'black' }: BackButtonProps) => {
  const router = useRouter();
  const { isAndroidWebView } = usePlatform();
  const { callNativeFunction } = useWebViewBridge();

  const handleBack = () => {
    // Android WebView에서는 네이티브 뒤로가기 호출
    if (isAndroidWebView && window.AndroidBridge?.goBack) {
      callNativeFunction('goBack');
      return;
    }

    // 일반 브라우저는 router.back() 사용
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 transition-colors duration-300 ${
        iconColor === 'white' ? 'text-white' : 'text-black'
      }`}
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
      {/* <span className="text-sm font-medium">Back</span> */}
    </button>
  );
};

export default BackButton;
