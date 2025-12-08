
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CountryCode } from '@/models/country-code.dto';
import { NationModal } from '@/components/template/modal/nations';
import InputPhoneNumber from '@/components/atoms/input/InputPhoneNumber';
import InputMessengerFields from '@/components/atoms/input/InputMessengerFields';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
import { questions } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_questions';
import { useLocale } from 'next-intl';
import { getLocalizedText } from '@/utils/i18n';

interface UserInfoStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

// demographicsBasic에서 필요한 필드 찾기
const ageGroupQuestion = questions.demographicsBasic.find(q => q.id === 'age_group');
const genderQuestion = questions.demographicsBasic.find(q => q.id === 'gender');
const ethnicBackgroundQuestion = questions.demographicsBasic.find(q => q.id === 'ethnic_background');
const conuntryOfResidenceQuestion = questions.demographicsBasic.find(q => q.id === 'country_of_residence');
const emailQuestion = questions.demographicsBasic.find(q => q.id === 'email');
const messengerQuestion = questions.demographicsBasic.find(q => q.id === 'messenger');
const phoneNumberQuestion = questions.demographicsBasic.find(q => q.id === 'phone_number');


const UserInfo: React.FC<UserInfoStepProps> = ({ data, onDataChange }) => {
  const locale = useLocale();
  const userInfo = data.userInfo || {};
  const [nation, setNation] = useState<CountryCode | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  // 국제번호 prefix 계산 (nation이 있으면 +phone_code, 없으면 기본값)
  const phonePrefix = nation?.phone_code ? `+${nation.phone_code}` : undefined;

  const handleChange = (field: string, value: string | number | undefined) => {
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
      {/* Age Range - Radio Buttons */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">
          {getLocalizedText(ageGroupQuestion?.title, locale) || 'Age Range'}
        </Label>
        <div role="radiogroup" aria-label="Age Range" className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {ageGroupQuestion?.options?.map((option) => (
            <ChoiceCard
              key={option.value}
              mode="single"
              title={getLocalizedText(option.label, locale)}
              selected={userInfo.ageRange === option.value}
              onSelect={() => handleChange('ageRange', option.value)}
              showIndicator={true}
            />
          ))}
        </div>
      </div>

      {/* Gender - Radio Buttons */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">
          {getLocalizedText(genderQuestion?.title, locale) || 'Gender'}
        </Label>
        <div role="radiogroup" aria-label="Gender" className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {genderQuestion?.options?.map((option) => (
            <ChoiceCard
              key={option.value}
              mode="single"
              title={getLocalizedText(option.label, locale)}
              selected={userInfo.gender === option.value}
              onSelect={() => handleChange('gender', option.value)}
              showIndicator={true}
            />
          ))}
        </div>
      </div>

      {/* Ethnic Background - Radio Buttons */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">
          {getLocalizedText(ethnicBackgroundQuestion?.title, locale) || 'Ethnic Background'}
        </Label>
        <div role="radiogroup" aria-label="Ethnic Background" className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {ethnicBackgroundQuestion?.options?.map((option) => (
            <ChoiceCard
              key={option.value}
              mode="single"
              title={getLocalizedText(option.label, locale)}
              selected={userInfo.ethnicBackground === option.value}
              onSelect={() => handleChange('ethnicBackground', option.value)}
              showIndicator={true}
            />
          ))}
        </div>
      </div>

      {/* Country */}
      <div className="space-y-2">
        {/* <Label className="text-gray-700 font-medium">
          {locale === 'ko' ? '국가' : 'Country'}
        </Label> */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">
            {getLocalizedText(conuntryOfResidenceQuestion?.helperText, locale)}
          </p>
          <NationModal
            nation={nation?.country_name || userInfo.country || ""}
            onSelect={(value: CountryCode) => {
              setNation(value);
              handleChange('country', value.country_name);
            }}
            title = {getLocalizedText(conuntryOfResidenceQuestion?.title, locale)}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">
          {getLocalizedText(emailQuestion?.title, locale) || 'Email Address'}
        </Label>
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
          placeholder={getLocalizedText(emailQuestion?.placeholder, locale) || 'Enter your email address'}
          aria-invalid={hasEmailError}
          aria-describedby={hasEmailError ? "email-error" : undefined}
        />
        {hasEmailError ? (
          <p id="email-error" className="text-sm text-rose-500">
            {emailError}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            {getLocalizedText(emailQuestion?.helperText, locale)}
          </p>
        )}
      </div>

      {/* Messenger Fields */}
      <div className="space-y-3">
        <Label className="text-gray-700 font-medium">
          {getLocalizedText(messengerQuestion?.helperText, locale)}
        </Label>

        <InputMessengerFields
          value={userInfo.messengers || []}
          onChange={(messengerInputs) => {
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

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
          {getLocalizedText(phoneNumberQuestion?.title, locale) || 'Phone Number (Optional)'}
        </Label>
        <Label htmlFor="phoneNumber_desc" className="text-gray-600 font-sm">
          {getLocalizedText(phoneNumberQuestion?.helperText, locale)}
        </Label>
        <InputPhoneNumber
          id="phoneNumber"
          value={userInfo.phoneNumber}
          onChange={(value) => handleChange('phoneNumber', value)}
          placeholder={getLocalizedText(phoneNumberQuestion?.placeholder, locale) || 'Enter phone number (numbers only)'}
          phonePrefix={phonePrefix}
        />
      </div>
    </div>
  );
};

export default UserInfo;
