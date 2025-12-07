import React, { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import { ContactsInfo } from '@/models/admin/basicinfo';


interface ContactsInfoSectionProps {
  onContactsChange: (contacts: ContactsInfo) => void;
  initialContacts?: ContactsInfo;
}

const ContactsInfoSection: React.FC<ContactsInfoSectionProps> = ({ 
  onContactsChange, 
  initialContacts 
}) => {
  const [formData, setFormData] = useState<ContactsInfo>({
    consultationPhone: initialContacts?.consultationPhone || '',
    consultationManagerPhones: initialContacts?.consultationManagerPhones || [],
    smsPhone: initialContacts?.smsPhone || '',
    eventManagerPhone: initialContacts?.eventManagerPhone || '',
    marketingEmails: initialContacts?.marketingEmails || []
  });

  // 데이터가 변경될 때마다 부모 컴포넌트에 전달
  useEffect(() => {
    onContactsChange(formData);
  }, [formData, onContactsChange]);

  const handleInputChange = (field: string, value: string, index?: number) => {
    setFormData(prev => {
      if (field === 'consultationManagerPhone' && index !== undefined) {
        // 상담 관리자 번호 배열 처리 - 동적 저장
        const newPhones = [...prev.consultationManagerPhones];
        newPhones[index] = value;
        
        // 빈 값들을 제거하고 순서대로 재배열
        const filteredPhones = newPhones.filter(phone => phone.trim() !== '');
        
        return {
          ...prev,
          consultationManagerPhones: filteredPhones
        };
      } else if (field === 'marketingEmails' && index !== undefined) {
        // 마케팅 이메일 배열 처리 - 동적 저장
        const newEmails = [...prev.marketingEmails];
        newEmails[index] = value;
        
        // 빈 값들을 제거하고 순서대로 재배열
        const filteredEmails = newEmails.filter(email => email.trim() !== '');
        
        return {
          ...prev,
          marketingEmails: filteredEmails
        };
      } else {
        // 일반 필드 처리
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <h2 className="text-xl font-semibold mb-6">부가 연락처 정보</h2>
      
      {/* ARS 정보 알림 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <p className="text-sm text-blue-700">
          ARS 전화번호는 연락처 정보에 기입하실 수 없습니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* 대표 전화번호 */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            대표 전화번호 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=""
              value={formData.representativePhone.split('-')[0] || ''}
              onChange={(e) => {
                const parts = formData.representativePhone.split('-');
                const newValue = [e.target.value, parts[1] || '', parts[2] || ''].join('-');
                handleInputChange('representativePhone', newValue);
              }}
            />
            <span className="flex items-center text-gray-500">-</span>
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=""
              value={formData.representativePhone.split('-')[1] || ''}
              onChange={(e) => {
                const parts = formData.representativePhone.split('-');
                const newValue = [parts[0] || '', e.target.value, parts[2] || ''].join('-');
                handleInputChange('representativePhone', newValue);
              }}
            />
          </div>
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-gray-600">
              병원의 대표 전화번호를 입력해주세요.
            </p>
          </div>
        </div> */}

        {/* 진료문의 번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            진료문의 전화 번호
          </label>
          <input
          name="consultationPhone"
            type="tel"
            inputMode="tel" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.consultationPhone}
            onChange={(e) => handleInputChange('consultationPhone', e.target.value)}
            placeholder="예: 02-1234-5678 또는 010-1234-5678"
          />
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-gray-600">
              고객이 플랫폼 상에서 병원과 전화로 상담을 원할 때 연결되는 병원의 전화번호를 입력해주세요. 050, 060, 070, 1522, 1577, 1588, 1688, 1899 등의 ARS 번호 번호는 등록할 수 없습니다. 
              플랫폼을 통한 고객과의 전화상담을 희망하지 않는 경우, 해당 정보는 공란으로 비워 두시면 됩니다.
            </p>
          </div>
        </div>

        {/* 상담 관리자 번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상담 관리자 전화 번호
          </label>
          <div className="flex flex-col space-y-2">
            {/* 항상 3개의 입력 필드 표시 */}
            {[0, 1, 2].map((index) => (
              <input
                key={`consultationManagerPhone-${index}`}
                name={`consultationManagerPhone-${index}`}
                type="tel"
                inputMode="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.consultationManagerPhones[index] || ''}
                onChange={(e) => handleInputChange('consultationManagerPhone', e.target.value, index)}
                placeholder="예: 02-1234-5678 또는 010-1234-5678"
              />
            ))}
          </div>
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-gray-600">
              고객이 플랫폼을 통해 상담을 신청했을 때, 알림을 받으실 병원 담당자의 전화번호를 입력해주세요. 해당 알림은 카카오톡/문자 메시지로 전달됩니다.
            </p>
          </div>
        </div>

        {/* SMS 발신 번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMS 발신 번호
          </label>
          <input
            name="smsPhone"
            type="tel"
            inputMode="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.smsPhone}
            onChange={(e) => handleInputChange('smsPhone', e.target.value)}
            placeholder="예: 02-1234-5678 또는 010-1234-5678"
          />
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-gray-600">
              플랫폼을 통해 상담을 신청한 고객에게 메시지를 발송할 때 사용되는 병원의 전화번호를 입력해주세요.
            </p>
          </div>
        </div>

        {/* 이벤트 관리자 번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이벤트 관리자 전화 번호
          </label>
          <input
            name="eventManagerPhone"
            type="tel"
            inputMode="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.eventManagerPhone}
            onChange={(e) => handleInputChange('eventManagerPhone', e.target.value)}
            placeholder="예: 02-1234-5678 또는 010-1234-5678"
          />
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-gray-600">
              제작하신 이벤트 검수내용에 대한 안내를 받으실 담당자의 전화번호를 입력해주세요.
            </p>
          </div>
        </div>

        {/* 마케팅 담당자 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            마케팅 담당자 이메일
          </label>
          <div className="flex flex-col space-y-2">
            {/* 항상 3개의 입력 필드 표시 */}
            {[0, 1, 2].map((index) => (
              <input
                key={`marketingEmail-${index}`}
                name={`marketingEmail-${index}`}
                type="email"
                inputMode="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이메일주소"
                value={formData.marketingEmails[index] || ''} 
                onChange={(e) => handleInputChange('marketingEmails', e.target.value, index)}
              />
            ))}
          </div>
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-gray-600">
              주요 광고사항, 뉴스레터(플랫폼 운영 현황 등 소식), 플랫폼 이용 정보(변경 사항 포함)및 플랫폼내 병원 관리에 도움이 될 안내를 받습니다.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ContactsInfoSection;
