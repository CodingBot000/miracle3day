
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { CountryCode } from '@/app/models/country-code.dto';
import { NationModal } from '@/components/template/modal/nations';
// import { demographicsBasicData } from '../../estimate/demographics-data';
import { getLocalizedText } from '@/utils/i18n';
import { useLocale } from 'next-intl';
import { questions } from '../../estimate/form-definition_questions';

interface UserInfoStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

// 순환 참조 방지를 위해 demographics-data.ts에서 가져옴
const ageGroupQuestion = questions.demographicsBasic.find(q => q.id === 'age_group');
const genderQuestion = questions.demographicsBasic.find(q => q.id === 'gender');
const ethnicBackgroundQuestion = questions.demographicsBasic.find(q => q.id === 'ethnic_background');


const UserInfo: React.FC<UserInfoStepProps> = ({ data, onDataChange }) => {
  const userInfo = data.userInfo || {};
  const locale = useLocale();
  const [nation, setNation] = useState<CountryCode | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>(undefined)

  
  const handleChange = (field: string, value: string | number | undefined) => {
    // if (field === 'email') {
    //   if (value && typeof value === 'string' && !isValidEmail(value)) {
    //     setEmailError("유효한 이메일 주소를 입력해주세요.")
    //   } else {
    //     setEmailError(undefined)
    //   }
    // }
    onDataChange({
      ...data,
      userInfo: {
        ...userInfo,
        [field]: value
      }
    });
  };


  const hasEmailError = !!emailError;
 
  return (
    <div className="space-y-6">
      {/* <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
          <Input
            id="firstName"
            value={userInfo.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
            placeholder="Enter your first name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
          <Input
            id="lastName"
            value={userInfo.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
            placeholder="Enter your last name"
          />
        </div>
      </div> */}

      {/* Age Range - Radio Buttons */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">
                {getLocalizedText(ageGroupQuestion?.title, locale) || 'Age Range'}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ageGroupQuestion?.options?.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-all
                      ${userInfo.ageRange === option.value
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="ageRange"
                      value={option.value}
                      checked={userInfo.ageRange === option.value}
                      onChange={(e) => handleChange('ageRange', e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">
                      {getLocalizedText(option.label, locale)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
      
            {/* Gender - Radio Buttons */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">
                {getLocalizedText(genderQuestion?.title, locale) || 'Gender'}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {genderQuestion?.options?.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-all
                      ${userInfo.gender === option.value
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={userInfo.gender === option.value}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">
                      {getLocalizedText(option.label, locale)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
      
            {/* Ethnic Background - Radio Buttons */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">
                {getLocalizedText(ethnicBackgroundQuestion?.title, locale) || 'Ethnic Background'}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ethnicBackgroundQuestion?.options?.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-all
                      ${userInfo.ethnicBackground === option.value
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="ethnicBackground"
                      value={option.value}
                      checked={userInfo.ethnicBackground === option.value}
                      onChange={(e) => handleChange('ethnicBackground', e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-center">
                      {getLocalizedText(option.label, locale)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
      
            {/* Country */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                {locale === 'ko' ? '국가' : 'Country'}
              </Label>
              <div>
                <NationModal
                  nation={nation?.country_name || userInfo.country || ""}
                  onSelect={(value: CountryCode) => {
                    setNation(value);
                    handleChange('country', value.country_name);
                  }}
                />
              </div>
            </div>
      {/* <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={userInfo.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`border ${
          hasEmailError
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
        }`}
          placeholder="Enter your email address"
          aria-invalid={hasEmailError}
          aria-describedby={hasEmailError ? "email-error" : undefined}
        />
        {hasEmailError ? (
        <p id="email-error" className="text-sm text-rose-500">
          {emailError}
        </p>
      ) : (
         <p className="text-sm text-gray-500">We&apos;ll use this to send your personalized treatment recommendations
         </p>
      )}
      </div>

      <div className="space-y-3">
        <InputMessengerFields
          value={userInfo.messengers || []}
          onChange={(messengerInputs) => {
            // Store only messengers with values for data consistency
            onDataChange({
              ...data,
              userInfo: {
                ...userInfo,
                messengers: messengerInputs
              }
            });
          }}
        />
      </div>


      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number (Optional)</Label>
        <Label htmlFor="phoneNumber_desc" className="text-gray-600 font-sm">
          We recommend providing your phone number for smoother communication and consultation.
          </Label>
        
        <InputPhoneNumber
          id="phoneNumber"
          value={userInfo.phoneNumber}
          onChange={(value) => handleChange('phoneNumber', value)}
          placeholder="Enter phone number (numbers only)"
        />
      </div> */}
    </div>
  );
};

export default UserInfo;
