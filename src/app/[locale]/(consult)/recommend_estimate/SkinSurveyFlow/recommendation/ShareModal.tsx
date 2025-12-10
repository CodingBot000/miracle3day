'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RecommendationOutput } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import { Copy, Check, Mail, MessageSquare, Download } from 'lucide-react';
import { krwToUsd } from '../questionnaire/questionScript/matching/utils/helpers';
import { useTranslations } from 'next-intl';

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  output: RecommendationOutput;
}

const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onOpenChange,
  output,
}) => {
  const t = useTranslations('ShareModal');
  const [copied, setCopied] = useState(false);

  const formatKRW = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate shareable text
  const generateShareText = () => {
    const treatmentList = output.recommendations
      .map((t, i) => `${i + 1}. ${t.label} - ${formatUSD(krwToUsd(t.priceKRW))}`)
      .join('\n');

    return `${t('shareTextTitle')}

${treatmentList}

${t('shareTextTotal')} ${formatUSD(output.totalPriceUSD)} (${formatKRW(output.totalPriceKRW)})`;
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('My Treatment Plan');
    const body = encodeURIComponent(generateShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSMSShare = () => {
    const body = encodeURIComponent(generateShareText());
    window.location.href = `sms:?body=${body}`;
  };

  const handleDownloadPDF = () => {
    // This is a placeholder - actual PDF generation would require a library like jsPDF
    alert(t('pdfComingSoon'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
              {generateShareText()}
            </pre>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Copy to clipboard */}
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t('copy')}</span>
                </>
              )}
            </Button>

            {/* Email */}
            <Button
              onClick={handleEmailShare}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>{t('email')}</span>
            </Button>

            {/* SMS */}
            <Button
              onClick={handleSMSShare}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('sms')}</span>
            </Button>

            {/* Download PDF */}
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{t('pdf')}</span>
            </Button>
          </div>

          {/* Social media note */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              {t('privacyNote')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
