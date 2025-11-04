
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountryCode } from '@/app/models/country-code.dto';
import { isValidEmail } from '@/utils/validators';
import { NationModal } from '@/components/template/modal/nations';
import InputPhoneNumber from '@/components/atoms/input/InputPhoneNumber';
import InputMessengerFields from '@/components/atoms/input/InputMessengerFields';

interface UserInfoStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const UserInfo: React.FC<UserInfoStepProps> = ({ data, onDataChange }) => {
  const userInfo = data.userInfo || {};
  const [nation, setNation] = useState<CountryCode | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>(undefined)

  
  const handleChange = (field: string, value: string | number | undefined) => {
    if (field === 'email') {
      if (value && typeof value === 'string' && !isValidEmail(value)) {
        setEmailError("유효한 이메일 주소를 입력해주세요.")
      } else {
        setEmailError(undefined)
      }
    }
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
      <div className="grid md:grid-cols-2 gap-6">
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Age Range</Label>
          <Select value={userInfo.ageRange || ''} onValueChange={(value) => handleChange('ageRange', value)}>
            <SelectTrigger className="border-rose-200 focus:border-rose-400" translate="no">
              <SelectValue placeholder="Select your age range" />
            </SelectTrigger>
            <SelectContent translate="no">
              <SelectItem value="teen" translate="no">
                <span translate="yes">Teen (14–19)</span>
              </SelectItem>
              <SelectItem value="20s" translate="no">
                <span translate="yes">20s</span>
              </SelectItem>
              <SelectItem value="30s" translate="no">
                <span translate="yes">30s</span>
              </SelectItem>
              <SelectItem value="40s" translate="no">
                <span translate="yes">40s</span>
              </SelectItem>
              <SelectItem value="50s" translate="no">
                <span translate="yes">50s</span>
              </SelectItem>
              <SelectItem value="60s" translate="no">
                <span translate="yes">60s</span>
              </SelectItem>
              <SelectItem value="70s+" translate="no">
                <span translate="yes">70+</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Gender</Label>
          <Select value={userInfo.gender || ''} onValueChange={(value) => handleChange('gender', value)}>
            <SelectTrigger className="border-rose-200 focus:border-rose-400" translate="no">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent translate="no">
              <SelectItem value="female" translate="no">
                <span translate="yes">Female</span>
              </SelectItem>
              <SelectItem value="male" translate="no">
                <span translate="yes">Male</span>
              </SelectItem>
              <SelectItem value="non-binary" translate="no">
                <span translate="yes">Non-binary</span>
              </SelectItem>
              <SelectItem value="prefer-not-to-say" translate="no">
                <span translate="yes">Prefer not to say</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Country</Label>
        {/* <div className="flex space-x-2">
          <button
            type="button"
            className="w-48 px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            onClick={() => setCountryModalOpen(true)}
          >
            <span>{selectedCountry.country_name}</span>
            <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div> */}
        {/* <CountrySelectModal
          open={countryModalOpen}
          countryList={country}
          onSelect={(item) => handleChange('phoneCountry', `${item.country_name})`)}
          onCancel={() => setCountryModalOpen(false)}
        /> */}
         <div>
          <NationModal
            nation={nation?.country_name || ""}
            onSelect={(value: CountryCode) => {
              setNation(value);
              handleChange('country', value.country_name);
            }}
          />
        </div>
    </div>                

      <div className="space-y-2">
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
        <Label htmlFor="koreanPhoneNumber" className="text-gray-700 font-medium">Korean Phone Number (Optional)</Label>
        <Label htmlFor="koreanPhoneNumber_desc" className="text-gray-600 font-sm">
          We recommend providing your Korean phone number for smoother communication and consultation.
          </Label>
        
        <InputPhoneNumber
          id="koreanPhoneNumber"
          value={userInfo.koreanPhoneNumber}
          onChange={(value) => handleChange('koreanPhoneNumber', value)}
          placeholder="Enter Korean phone number (numbers only)"
        />
      </div>
    </div>
  );
};

export default UserInfo;
