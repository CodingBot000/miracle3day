"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./hero.module.scss";

// 이미지 파일 경로 배열
const heroImages = [
  "/heroImg/hero0.jpg",
  "/heroImg/hero1.jpg",
  "/heroImg/hero2.jpg",
  "/heroImg/hero3.jpg",
  "/heroImg/hero4.jpg",
  "/heroImg/hero5.jpg",
  "/heroImg/hero6.jpg",
];

export const Hero = () => {
  // 현재 표시되는 이미지와 다음 이미지의 인덱스
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  
  // 현재 이미지의 투명도 상태 (1: 완전 불투명, 0: 완전 투명)
  const [activeOpacity, setActiveOpacity] = useState(1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // 현재 이미지를 천천히 투명하게 만들기 시작
      const fadeOutInterval = setInterval(() => {
        setActiveOpacity(prev => {
          // 0.02씩 감소하여 총 500ms 동안 페이드 아웃
          const newOpacity = Math.max(0, prev - 0.02);
          
          // 완전히 투명해지면 인덱스 업데이트 및 투명도 초기화
          if (newOpacity <= 0) {
            clearInterval(fadeOutInterval);
            
            // 다음 이미지를 현재 이미지로 설정
            setActiveIndex(nextIndex);
            
            // 다음 이미지의 인덱스 업데이트
            setNextIndex((nextIndex + 1) % heroImages.length);
            
            // 투명도 다시 1로 설정
            setActiveOpacity(1);
          }
          
          return newOpacity;
        });
      }, 10); // 10ms마다 투명도 업데이트
      
      return () => clearInterval(fadeOutInterval);
    }, 5000); // 5초마다 이미지 전환
    
    return () => clearInterval(interval);
  }, [nextIndex]);
  
  return (
    <div className={styles.hero_container}>
      <div className={styles.hero_wrapper}>
        {/* 두 이미지를 항상 겹쳐서 표시 */}
        
        {/* 다음 이미지 (항상 뒤에 있음) */}
        <div className={`${styles.hero_image_wrapper} ${styles.next_image}`}>
          <Image
            src={heroImages[nextIndex]}
            alt={`Next Hero Image`}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className={styles.hero_image}
          />
        </div>
        
        {/* 현재 이미지 (앞에 있으며 서서히 투명해짐) */}
        <div className={`${styles.hero_image_wrapper} ${styles.active_image}`}>
          <Image
            src={heroImages[activeIndex]}
            alt={`Current Hero Image`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className={styles.hero_image}
            style={{ 
              opacity: activeOpacity,
              transition: 'opacity 10ms linear' // 부드러운 전환을 위해 linear 사용
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
