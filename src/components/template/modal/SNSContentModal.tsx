"use client";

import React, { useState } from "react";


export default function SNSConsentButton() {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700"
        >
          SNS 콘텐츠 사용 안내 보기
        </button>
  
        <SNSConsentModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    );
  }

function SNSConsentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 max-w-lg rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">SNS 콘텐츠 사용 동의 안내</h2>
        <p className="mb-2">
          저희 플랫폼은 귀하의 병원이 운영 중인 KakaoTalk, Instagram, TikTok 등 SNS 채널의 콘텐츠를 
          병원의 진료 서비스와 시술 정보를 더 많은 고객에게 알리고{" "}
          <span className="font-bold text-red-600">**홍보 목적으로만**</span> 사용합니다.
        </p>
        <p className="mb-2">
          공유된 콘텐츠는{" "}
          <span className="font-bold text-red-600">**귀하 병원의 홍보와 예약 유치에만 사용**</span>되며,
          타 병원 또는 제3자 홍보, 무단 배포, 상업적 재판매에는 절대 사용되지 않습니다.
        </p>
        <p className="mb-2">
          <span className="font-bold text-red-600">**무단 편집, 허위 정보 삽입**</span> 등 병원의 신뢰성을 해치는
          행위는 절대 하지 않으며, 병원의 가치와 강점을 더 많은 고객에게 전달할 수 있도록 돕겠습니다.
        </p>
        <p className="mb-4">
          본 내용에 동의하시면 SNS 채널 콘텐츠를 플랫폼 홍보 영역(웹, 앱, 광고 등)에 활용하겠습니다.
        </p>
        <p className="mb-4">
          동의한 내용은 언제든 철회 가능하며, 철회시 즉시 이용하던 모든 콘텐츠 공유가 중단됩니다.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
        >
          확인
        </button>
      </div>
    </div>
  );
}
