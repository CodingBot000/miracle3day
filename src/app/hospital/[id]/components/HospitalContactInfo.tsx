import { HospitalDetailInfo } from "@/app/models/hospitalData.dto";
import { useState } from "react";

type ContactType = 'tel' | 'email' | 'link';

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  type: ContactType;
}

interface HospitalContactInfoProps {
  hospitalDetails: HospitalDetailInfo;
}

const HospitalContactInfo = ({ hospitalDetails }: HospitalContactInfoProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const handleClick = (item: ContactItem) => {
    if (item.type === 'tel') {
      // 모바일에서는 전화걸기
      window.location.href = `tel:${item.value}`;
    } else if (item.type === 'email') {
      // 이메일 클라이언트 열기
      window.location.href = `mailto:${item.value}`;
    } else if (item.type === 'link') {
      const value = item.value.toLowerCase();
      
      if (value.includes('instagram') || value.includes('@') && item.label.toLowerCase() === 'instagram') {
        // Instagram 앱 또는 웹사이트
        const instagramUrl = value.startsWith('@') 
          ? `https://instagram.com/${value.slice(1)}`
          : value.startsWith('http') ? value : `https://instagram.com/${value}`;
        
        // 모바일에서 앱 시도 후 웹사이트로 fallback
        const appUrl = `instagram://user?username=${value.replace('@', '')}`;
        
        // 앱 시도
        const appLink = document.createElement('a');
        appLink.href = appUrl;
        appLink.click();
        
        // 1초 후 웹사이트로 fallback
        setTimeout(() => {
          window.open(instagramUrl, '_blank');
        }, 1000);
      } else if (value.includes('facebook')) {
        // Facebook 처리
        const facebookUrl = value.startsWith('http') ? value : `https://facebook.com/${value}`;
        window.open(facebookUrl, '_blank');
      } else {
        // 일반 웹사이트
        const url = value.startsWith('http') ? value : `https://${value}`;
        window.open(url, '_blank');
      }
    }
  };
  const contactItems: ContactItem[] = [
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3 14.5C11.9111 14.5 10.5389 14.1973 9.18333 13.592C7.82778 12.9867 6.59444 12.1282 5.48333 11.0167C4.37222 9.90511 3.514 8.67178 2.90867 7.31667C2.30333 5.96156 2.00044 4.58933 2 3.2C2 3 2.06667 2.83333 2.2 2.7C2.33333 2.56667 2.5 2.5 2.7 2.5H5.4C5.55556 2.5 5.69444 2.55289 5.81667 2.65867C5.93889 2.76444 6.01111 2.88933 6.03333 3.03333L6.46667 5.36667C6.48889 5.54444 6.48333 5.69444 6.45 5.81667C6.41667 5.93889 6.35556 6.04444 6.26667 6.13333L4.65 7.76667C4.87222 8.17778 5.136 8.57489 5.44133 8.958C5.74667 9.34111 6.08289 9.71067 6.45 10.0667C6.79444 10.4111 7.15556 10.7307 7.53333 11.0253C7.91111 11.32 8.31111 11.5893 8.73333 11.8333L10.3 10.2667C10.4 10.1667 10.5307 10.0918 10.692 10.042C10.8533 9.99222 11.0116 9.97822 11.1667 10L13.4667 10.4667C13.6222 10.5111 13.75 10.5918 13.85 10.7087C13.95 10.8256 14 10.956 14 11.1V13.8C14 14 13.9333 14.1667 13.8 14.3C13.6667 14.4333 13.5 14.5 13.3 14.5ZM4.01667 6.5L5.11667 5.4L4.83333 3.83333H3.35C3.40556 4.28889 3.48333 4.73889 3.58333 5.18333C3.68333 5.62778 3.82778 6.06667 4.01667 6.5ZM9.98333 12.4667C10.4167 12.6556 10.8584 12.8056 11.3087 12.9167C11.7589 13.0278 12.2116 13.1 12.6667 13.1333V11.6667L11.1 11.35L9.98333 12.4667Z" fill="black"/>
        </svg>
      ),
      label: "Tel",
      value: hospitalDetails.tel,
      type: "tel"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.66667 3.83325H13.3333C13.7 3.83325 14 4.13325 14 4.49992V12.4999C14 12.8666 13.7 13.1666 13.3333 13.1666H2.66667C2.3 13.1666 2 12.8666 2 12.4999V4.49992C2 4.13325 2.3 3.83325 2.66667 3.83325Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 4.83325L8 8.49992L14 4.83325" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: "email",
      value: hospitalDetails.email,
      type: "email"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.6667 3.16675C13.0203 3.16675 13.3594 3.30722 13.6095 3.55727C13.8595 3.80732 14 4.14646 14 4.50008V12.5001C14 12.8537 13.8595 13.1928 13.6095 13.4429C13.3594 13.6929 13.0203 13.8334 12.6667 13.8334H3.33333C2.97971 13.8334 2.64057 13.6929 2.39052 13.4429C2.14048 13.1928 2 12.8537 2 12.5001V4.50008C2 4.14646 2.14048 3.80732 2.39052 3.55727C2.64057 3.30722 2.97971 3.16675 3.33333 3.16675H12.6667ZM12.6667 7.16675H3.33333V11.8334C3.33335 11.9967 3.3933 12.1543 3.50181 12.2763C3.61032 12.3984 3.75983 12.4763 3.922 12.4954L4 12.5001H12C12.1633 12.5001 12.3209 12.4401 12.4429 12.3316C12.5649 12.2231 12.6429 12.0736 12.662 11.9114L12.6667 11.8334V7.16675ZM4 4.50008C3.82319 4.50008 3.65362 4.57032 3.5286 4.69534C3.40357 4.82037 3.33333 4.98994 3.33333 5.16675C3.33333 5.34356 3.40357 5.51313 3.5286 5.63815C3.65362 5.76318 3.82319 5.83341 4 5.83341C4.17681 5.83341 4.34638 5.76318 4.4714 5.63815C4.59643 5.51313 4.66667 5.34356 4.66667 5.16675C4.66667 4.98994 4.59643 4.82037 4.4714 4.69534C4.34638 4.57032 4.17681 4.50008 4 4.50008ZM6 4.50008C5.82319 4.50008 5.65362 4.57032 5.5286 4.69534C5.40357 4.82037 5.33333 4.98994 5.33333 5.16675C5.33333 5.34356 5.40357 5.51313 5.5286 5.63815C5.65362 5.76318 5.82319 5.83341 6 5.83341C6.17681 5.83341 6.34638 5.76318 6.4714 5.63815C6.59643 5.51313 6.66667 5.34356 6.66667 5.16675C6.66667 4.98994 6.59643 4.82037 6.4714 4.69534C6.34638 4.57032 6.17681 4.50008 6 4.50008ZM8 4.50008C7.82319 4.50008 7.65362 4.57032 7.5286 4.69534C7.40357 4.82037 7.33333 4.98994 7.33333 5.16675C7.33333 5.34356 7.40357 5.51313 7.5286 5.63815C7.65362 5.76318 7.82319 5.83341 8 5.83341C8.17681 5.83341 8.34638 5.76318 8.4714 5.63815C8.59643 5.51313 8.66667 5.34356 8.66667 5.16675C8.66667 4.98994 8.59643 4.82037 8.4714 4.69534C8.34638 4.57032 8.17681 4.50008 8 4.50008Z" fill="black"/>
        </svg>
      ),
      label: "homepage",
      value: hospitalDetails.other_channel,
      type: "link"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "kakao_talk",
      value: hospitalDetails.kakao_talk,
      type: "link"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "line",
      value: hospitalDetails.line,
      type: "link"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "we_chat",
      value: hospitalDetails.we_chat,
      type: "link"
    },
        {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "whats_app",
      value: hospitalDetails.whats_app,
      type: "link"
    },
        {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "telegram",
      value: hospitalDetails.telegram,
      type: "link"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "facebook_messenger",
      value: hospitalDetails.facebook_messenger,
      type: "link"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "instagram",
      value: hospitalDetails.instagram,
      type: "link"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "tiktok",
      value: hospitalDetails.tiktok,
      type: "link"
    },
    {
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7.83333C2 5.31933 2 4.062 2.78133 3.28133C3.56267 2.50067 4.81933 2.5 7.33333 2.5H8.66667C11.1807 2.5 12.438 2.5 13.2187 3.28133C13.9993 4.06267 14 5.31933 14 7.83333V9.16667C14 11.6807 14 12.938 13.2187 13.7187C12.4373 14.4993 11.1807 14.5 8.66667 14.5H7.33333C4.81933 14.5 3.562 14.5 2.78133 13.7187C2.00067 12.9373 2 11.6807 2 9.16667V7.83333Z" stroke="black" strokeWidth="2"/>
          <path d="M11 6.5C11.5523 6.5 12 6.05228 12 5.5C12 4.94772 11.5523 4.5 11 4.5C10.4477 4.5 10 4.94772 10 5.5C10 6.05228 10.4477 6.5 11 6.5Z" fill="black"/>
          <path d="M8 10.5C9.10457 10.5 10 9.60457 10 8.5C10 7.39543 9.10457 6.5 8 6.5C6.89543 6.5 6 7.39543 6 8.5C6 9.60457 6.89543 10.5 8 10.5Z" stroke="black" strokeWidth="2"/>
        </svg>
      ),
      label: "youtube",
      value: hospitalDetails.youtube,
      type: "link"
    },
  ];

  return (
    <div className="space-y-3">
      {contactItems
        .filter(item => (item.value && item.value.trim() !== '') && !(item.label === 'email' && item.value.includes('notexist')))
        .map((item, index) => (
          <div key={index} className="flex items-center gap-1 group">
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            <span className="text-sm font-semibold text-gray-800 min-w-[60px]">
              {item.label}
            </span>
            <span 
              className="text-sm text-gray-800 cursor-pointer hover:text-blue-600 flex-1"
              onClick={() => handleClick(item)}
            >
              {item.value}
            </span>
            
            {/* 복사 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(item.value, index);
              }}
              className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
              title="복사하기"
            >
              {copiedIndex === index ? (
                // 복사 완료 아이콘
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                // 복사 아이콘
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2H12C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V4C2 2.89543 2.89543 2 4 2Z" stroke="#6b7280" strokeWidth="1.5"/>
                  <path d="M10 6H14V10" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        ))}
    </div>
  );
};

export default HospitalContactInfo;
