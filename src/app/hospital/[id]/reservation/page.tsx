'use client';

import React, { useState } from 'react';
import { FiArrowLeft, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { country } from '@/constants/country';
import CountrySelectModal from '@/components/template/modal/CountrySelectModal';
import { NationModal } from '@/app/auth/sign-up/components/modal/nations';
import { CountryCode } from '@/app/models/country-code.dto';

export default function ReservationPage() {
  const [formData, setFormData] = useState({
    englishName: '',
    nationality: '',
    email: '',
    phoneCountry: `${country[0].country_name} (+${country[0].phone_code})`,
    phoneNumber: '',
    passportName: '',
    gender: '',
    dateOfBirth: '',
    visitorsCount: '',
    improvementAreas: '',
    consultationFor: '',
    treatmentExperience: '',
    koreaPhone: '',
    reservationCount: '',
    interpreterLanguage: '',
    agreeReservation: false,
    agreeNoShow: false
  });

  const [nation, setNation] = useState<CountryCode | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const selectedCountry = country.find(c => `${c.country_name} (+${c.phone_code})` === formData.phoneCountry) || country[0];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button className="flex items-center text-gray-600 hover:text-gray-800">
            <FiArrowLeft className="mr-2" />
            BACK
          </button>
          <h1 className="text-xl font-semibold">ENTER INFO</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-center max-w-4xl mx-auto">
          <FiAlertTriangle className="text-yellow-600 mr-3 text-xl" />
          <span className="text-yellow-800 font-medium">
            We don&apos;t have many spots left. Reserve now!
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Reservation Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Reservation items</h2>
          <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Cheongdam Eclat De | Skin Treatment in Cheongdam Dermatology</h3>
              <p className="text-gray-600 text-sm mt-1">2025-07-22, 14:00</p>
              <button className="mt-2 px-4 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                OPTIONS
              </button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                           <p className="text-sm text-gray-700">
                 Lifting &amp; Oligio X Package: Includes 100 shots of Oligio X + Cleansing + Sebum Removal (X-Lotion) + Topical Anesthesia + Regeneration Laser &amp; Deposit (20%) x 1
               </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.englishName}
                onChange={(e) => handleInputChange('englishName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your English name"
              />
            </div>
            
            <div>
              <NationModal
                nation={nation?.country_name || ""}
                onSelect={(value: CountryCode) => {
                  setNation(value)
                  handleInputChange('nationality', value.country_code)
                }}
              />
              {errors.nation && (
                <p className="text-sm text-red-500 mt-1">{errors.nation}</p>
              )}
            </div>
      {/*       <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality <span className="text-red-500">*</span>
              </label>
               <select
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select One</option>
                <option value="US">United States</option>
                <option value="KR">Korea</option>
                <option value="JP">Japan</option>
                <option value="CN">China</option>
              </select>
              
            </div> 
*/}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Mobile) <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  onClick={() => setCountryModalOpen(true)}
                >
                  <span>{selectedCountry.country_name} (+{selectedCountry.phone_code})</span>
                  <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex) 2015550123"
                />
                <CountrySelectModal
                  open={countryModalOpen}
                  countryList={country}
                  onSelect={(item) => handleInputChange('phoneCountry', `${item.country_name} (+${item.phone_code})`)}
                  onCancel={() => setCountryModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name on Passport (in English)
              </label>
              <input
                type="text"
                value={formData.passportName}
                onChange={(e) => handleInputChange('passportName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">SELECT</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mm/dd/yyyy"
                />
                <FaRegCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Please indicate the number of visitors
              </label>
              <input
                type="text"
                value={formData.visitorsCount}
                onChange={(e) => handleInputChange('visitorsCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Are there any areas or symptoms you&apos;d like to improve?
              </label>
              <textarea
                value={formData.improvementAreas}
                onChange={(e) => handleInputChange('improvementAreas', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Is there anything you would like consultation for?
              </label>
              <textarea
                value={formData.consultationFor}
                onChange={(e) => handleInputChange('consultationFor', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Have you ever received or heard of this skin treatment before?
              </label>
              <textarea
                value={formData.treatmentExperience}
                onChange={(e) => handleInputChange('treatmentExperience', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone number available for contact in Korea (if available) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.koreaPhone}
                onChange={(e) => handleInputChange('koreaPhone', e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-red-500 text-sm mt-1">Please fill in the blanks</p>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.agreeReservation}
                onChange={(e) => handleInputChange('agreeReservation', e.target.checked)}
                className="mt-1"
              />
              <label className="text-sm text-gray-700">
                Please make the same amount of reservations as the amount of people that will be receiving procedures. (One person can make reservation for 2 or more products.)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How many people are in the reservation?
              </label>
              <select
                value={formData.reservationCount}
                onChange={(e) => handleInputChange('reservationCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">SELECT</option>
                {Array.from({ length: 20 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
                <option value="more">Booked by more than 20 people</option>
              </select>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.agreeNoShow}
                onChange={(e) => handleInputChange('agreeNoShow', e.target.checked)}
                className="mt-1"
              />
              <label className="text-sm text-gray-700">
                If there are accumulated no-shows, there may be restrictions on future services. Please make sure to visit on the confirmed date/time and avoid being late.
              </label>
            </div>

            <p className="text-red-500 text-sm">You must accept the terms and conditions to proceed.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Which language interpreter do you need?
              </label>
              <select
                value={formData.interpreterLanguage}
                onChange={(e) => handleInputChange('interpreterLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">SELECT</option>
                <option value="english">English</option>
                <option value="japanese">Japanese</option>
                <option value="chinese">Chinese</option>
                <option value="none">No interpreter needed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
