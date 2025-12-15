'use client';

import { Delete, Headset } from "lucide-react";
import { Link } from "@/i18n/routing";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useLocale } from "next-intl";
import TermsHtmlModal from "@/components/template/modal/TermsHtmlModal";
import { terms } from "@/app/[locale]/(auth)/terms/TermsClient";

const LanguageSwitcherNextIntl = dynamic(() => import("@/components/organism/layout/LanguageSwitcherNextIntl"), {
  ssr: false,
});

export const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | undefined>(undefined);
  const [modalTitle, setModalTitle] = useState<string>('View');
  const locale = useLocale() as 'ko' | 'en';

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

  const handleAboutUsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutUsUrl = `/static/about_us/about-us-${locale}.html`;
    openModal(aboutUsUrl, 'About Us');
  };

  return (
    <footer className="min-h-[200px] flex flex-col items-center gap-3 p-8 mt-8 bg-gray-300 text-center text-sm text-gray-600 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            {/* <DeleteUserButton uid="109baff6-2d4a-4119-818d-e65fd9289a41" /> */}
      <div className="flex flex-wrap justify-center items-center gap-4">
        <span className="flex items-center gap-1">
          <LanguageSwitcherNextIntl /> Language
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
        <span className="mx-1">|</span>
        <Link href="/about-us" onClick={handleAboutUsClick} className="hover:underline">
          About Us
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
