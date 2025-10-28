// import { Delete, Headset } from "lucide-react";


// export const Footer = () => {
//   return (
//     <footer className="flex justify-center items-center p-8 mt-8 bg-[#fdfcfc]">
//       {/* <DeleteUserButton uid="109baff6-2d4a-4119-818d-e65fd9289a41" /> */}
//       {/* todo footer 내용 */}

//       <address>ⓒ BeautyWell Corp.</address>
//     </footer>
//   );
// };




'use client';

import { Delete, Headset } from "lucide-react";
// import { LanguageSelector } from "@/components/organism/layout/LanguageSelector";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";
import TermsHtmlModal from "@/components/template/modal/TermsHtmlModal";
import { terms } from "@/app/auth/terms/TermsClient";

const LanguageSelector = dynamic(() => import("@/components/organism/layout/LanguageSelector"), {
  ssr: false,
});

export const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | undefined>(undefined);
  const [modalTitle, setModalTitle] = useState<string>('View');
  const { language } = useCookieLanguage();
  const locale = language === 'ko' ? 'ko' : 'en';

  const openModal = (src: string | undefined, title: string) => {
    if (!src) return;
    setModalSrc(src);
    setModalTitle(title);
    setModalOpen(true);
  };

  const handlePrivacyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const privacyTerm = terms.find(term => term.id === 'privacy');
    if (privacyTerm) {
      const termHref = privacyTerm.url?.[locale] ?? privacyTerm.url?.en;
      openModal(termHref, privacyTerm.label);
    }
  };

  const handleTermsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const serviceTerm = terms.find(term => term.id === 'service');
    if (serviceTerm) {
      const termHref = serviceTerm.url?.[locale] ?? serviceTerm.url?.en;
      openModal(termHref, serviceTerm.label);
    }
  };

  return (
    <footer className="min-h-[200px] flex flex-col items-center gap-3 p-8 mt-8 bg-[#fdfcfc] text-center text-sm text-gray-600 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            {/* <DeleteUserButton uid="109baff6-2d4a-4119-818d-e65fd9289a41" /> */}
      <div className="flex flex-wrap justify-center items-center gap-4">
        <span className="flex items-center gap-1">
          <LanguageSelector /> Language
        </span>

        <Link href="/support/customer-support" className="flex items-center gap-1 hover:underline">
          <Headset size={16} /> Customer Support
        </Link>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2">
        <span>@BeautyWell Corp</span>
        <span className="mx-1">|</span>

        <Link href="/legal/privacy" onClick={handlePrivacyClick} className="hover:underline">
          Privacy Policy
        </Link>
        <span className="mx-1">|</span>
        <Link href="/legal/terms" onClick={handleTermsClick} className="hover:underline">
          Terms
        </Link>
      </div>

      <TermsHtmlModal
        open={modalOpen}
        src={modalSrc}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
      />
    </footer>
  );
};
