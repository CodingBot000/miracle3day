// components/InstagramFeed.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

// Mirror App iframe bridge 타입 선언
declare global {
  interface Window {
    iFrameSetup?: (iframe: HTMLIFrameElement) => void;
  }
}

interface InstagramFeedProps {
  feedId: string;
  className?: string;
}

export default function InstagramFeed({ 
  feedId,
  className = ''
}: InstagramFeedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
    if (iframeRef.current && window.iFrameSetup) {
      window.iFrameSetup(iframeRef.current);
    }
  };

  return (
    <div className={className}>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mirrorapp/iframe-bridge@latest/dist/index.umd.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      
      <iframe
        ref={iframeRef}
        src={`https://app.mirror-app.com/feed-instagram/${feedId}/preview`}
        className="w-full border-0"
        scrolling="no"
        title="Instagram Feed"
        onLoad={() => {
          if (isScriptLoaded && window.iFrameSetup) {
            window.iFrameSetup(iframeRef.current!);
          }
        }}
      />
    </div>
  );
}