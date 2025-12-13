"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface HeroVideosProps {
  children?: React.ReactNode;
}

export default function HeroVideos({ children }: HeroVideosProps) {
  return (
    <div className="relative w-full h-[45vh] md:h-[60vh] md:rounded-lg overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{
          minWidth: "100%",
          minHeight: "100%",
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/video/hero_video_thumbnail.png"
      >
        <source src="/video/hero_video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 오버레이 - children으로 전달받음 */}
      {children}
    </div>
  );
}


// type SourceItem = { src: string; type?: string; poster?: string; fallbackDuration?: number };

// interface HeroVideosProps {
//   children?: React.ReactNode;
//   // 기본 3개 소스. 필요하면 외부에서 주입 가능
//   sources?: SourceItem[];
//   // 페이드 전환 시간(ms)
//   crossfadeMs?: number;
//   // 메타데이터 실패 시 사용할 기본 길이(초)
//   defaultDurationSec?: number;
//   className?: string;
// }

// export default function HeroVideos({
//   children,
//   sources,
//   crossfadeMs = 400,
//   defaultDurationSec = 5,
//   className = "relative w-full h-[45vh] md:h-[60vh] lg:h-[700px] md:rounded-lg overflow-hidden"
// }: HeroVideosProps) {
//   const list = useMemo<SourceItem[]>(
//     () =>
//       (sources && sources.length > 0
//         ? sources
//         : [
//             { src: "/video/hero_video.mp4", type: "video/mp4", poster: "/video/hero_video_thumbnail.png" },
//             { src: "/video/hero_video2.mp4", type: "video/mp4" },
//             { src: "/video/hero_video3.mp4", type: "video/mp4" }
//           ]),
//     [sources]
//   );

//   // 두 개의 비디오를 번갈아 사용 (ping-pong)
//   const vA = useRef<HTMLVideoElement>(null);
//   const vB = useRef<HTMLVideoElement>(null);

//   // A가 화면에 보이는지 여부
//   const [showA, setShowA] = useState(true);
//   // 현재 재생 중인 인덱스
//   const [idx, setIdx] = useState(0);
//   // 각 소스의 실제 길이(초) 캐시
//   const durationsRef = useRef<Record<number, number>>({});
//   // 페이드 스타일을 위한 인라인 duration
//   const fadeStyle = { transition: `opacity ${crossfadeMs}ms ease` };

//   // 현재/다음 비디오 ref 계산
//   const curRef = showA ? vA : vB;
//   const nextRef = showA ? vB : vA;

//   // 현재 소스 / 다음 소스
//   const curSrc = list[idx % list.length];
//   const nextSrc = list[(idx + 1) % list.length];

//   // 현재 소스 로드
//   useEffect(() => {
//     const v = curRef.current;
//     if (!v) return;

//     // 소스 주입
//     attachSource(v, curSrc);
//     v.muted = true;
//     v.playsInline = true;
//     v.preload = "auto";

//     // iOS/Safari 자동재생 보조
//     const playSafe = async () => {
//       try {
//         await v.play();
//       } catch {
//         // 사용자 제스처 필요 시, 그냥 대기 (일반적으로 muted면 재생됨)
//       }
//     };

//     // 길이 캐싱
//     const onLoadedMeta = () => {
//       if (!Number.isFinite(v.duration) || v.duration === Infinity) return;
//       durationsRef.current[idx % list.length] = v.duration;
//     };

//     v.addEventListener("loadedmetadata", onLoadedMeta);
//     playSafe();

//     return () => {
//       v.removeEventListener("loadedmetadata", onLoadedMeta);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [idx, showA, curSrc.src]);

//   // 다음 소스 미리 로드 & 거의 끝나갈 때 크로스페이드
//   useEffect(() => {
//     const cur = curRef.current;
//     const nxt = nextRef.current;
//     if (!cur || !nxt) return;

//     // 다음 소스 미리 장착 + 로드
//     attachSource(nxt, nextSrc);
//     nxt.muted = true;
//     nxt.playsInline = true;
//     nxt.preload = "auto";
//     nxt.load();

//     let raf = 0;

//     const check = () => {
//       const cached = durationsRef.current[idx % list.length];
//       const duration = Number.isFinite(cached) ? cached : (cur.duration && Number.isFinite(cur.duration) ? cur.duration : (nextSrc.fallbackDuration ?? defaultDurationSec));
//       const leadTime = Math.max(crossfadeMs / 1000 + 0.1, 0.25); // 크로스페이드 + 여유
//       if (cur.currentTime >= duration - leadTime) {
//         // 다음 비디오 재생 시작
//         nxt.currentTime = 0;
//         nxt.play().catch(() => {});
//         // 페이드 전환
//         setShowA(prev => !prev);
//         // 인덱스 증가 (다음 소스로 이동)
//         setTimeout(() => {
//           setIdx(prev => (prev + 1) % list.length);
//         }, crossfadeMs);

//         return; // 이번 사이클 종료
//       }
//       raf = requestAnimationFrame(check);
//     };

//     raf = requestAnimationFrame(check);
//     return () => cancelAnimationFrame(raf);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [idx, nextSrc.src, crossfadeMs]);

//   // 탭 비가시성에 따른 일시정지/재개 (배터리 절약)
//   useEffect(() => {
//     const onVis = () => {
//       const cur = curRef.current;
//       const nxt = nextRef.current;
//       if (!cur || !nxt) return;
//       if (document.hidden) {
//         cur.pause();
//         nxt.pause();
//       } else {
//         cur.play().catch(() => {});
//       }
//     };
//     document.addEventListener("visibilitychange", onVis);
//     return () => document.removeEventListener("visibilitychange", onVis);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className={className}>
//       {/* Video A */}
//       <video
//         ref={vA}
//         className={`absolute inset-0 h-full w-full object-cover object-center ${showA ? "opacity-100" : "opacity-0"}`}
//         style={fadeStyle}
//         autoPlay
//         loop={false}
//         muted
//         playsInline
//       />

//       {/* Video B */}
//       <video
//         ref={vB}
//         className={`absolute inset-0 h-full w-full object-cover object-center ${showA ? "opacity-0" : "opacity-100"}`}
//         style={fadeStyle}
//         autoPlay
//         loop={false}
//         muted
//         playsInline
//       />

//       {/* 오버레이 */}
//       {children}
//     </div>
//   );
// }

// /** 현재 비디오 요소에 소스를 교체 연결 */
// function attachSource(video: HTMLVideoElement, src: SourceItem) {
//   // 이미 같은 소스면 스킵
//   if (video.dataset.src === src.src) return;

//   video.pause();
//   // 기존 <source> 제거
//   while (video.firstChild) video.removeChild(video.firstChild);

//   const sourceEl = document.createElement("source");
//   sourceEl.src = src.src;
//   sourceEl.type = src.type || "video/mp4";
//   video.appendChild(sourceEl);

//   if (src.poster) video.poster = src.poster;

//   video.dataset.src = src.src;
//   video.load();
// }

