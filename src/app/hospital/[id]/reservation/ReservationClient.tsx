'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { country } from '@/constants/country';
import CountrySelectModal from '@/components/template/modal/CountrySelectModal';
import { CountryCode } from '@/app/models/country-code.dto';
import { useReservationStore } from '@/stores/useReservationStore';
import { UserOutputDto } from '@/app/api/auth/getUser/getUser.dto';
import { HospitalDetailMainOutput } from '@/app/api/hospital/[id]/main/main.dto';
import ReservationModal from '@/components/template/modal/ReservationModal';
import ReservationCalendarClient from '@/app/hospital/[id]/components/content/ReservationCalendarClient';
import HospitalListCard from '@/app/hospital/components/HospitalListCard';

interface ReservationClientProps {
  initialUserData: UserOutputDto | null;
  hospitalId: string;
  hospitalData: HospitalDetailMainOutput;
}

export default function ReservationClient({ initialUserData, hospitalId, hospitalData }: ReservationClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
        id_user: '',
        id_uuid_hospital: '',
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
    agreeNoShow: false,
  

  });

  const [nation, setNation] = useState<CountryCode | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const selectedCountry = country.find(c => `${c.country_name} (+${c.phone_code})` === formData.phoneCountry) || country[0];

  // Zustand store에서 데이터 가져오기
  const reservationUserInfo = useReservationStore.getState().reservationUserInfo;
  
  console.log("ReservationClient reservationUserInfo", reservationUserInfo);
  console.log("ReservationClient initialUserData", initialUserData);

  // 컴포넌트 마운트 시 데이터 셋팅
  useEffect(() => {
    const userInfo = initialUserData?.userInfo;
    console.log('ReservationClient userInfo : ', userInfo);
    if (!userInfo) {
      console.log("ReservationClient userInfo not found");
      // Set default birth date to 20 years ago if no user data
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 20);
      setBirthDate(defaultDate);
      return;
    }
    
    const newFormData = { ...formData };

    // reservationUserInfo에서 셋팅
    // if (reservationUserInfo?.date) {
    //   newFormData.date = reservationUserInfo.date;
    // }
    // if (reservationUserInfo?.time) {
    //   newFormData.time = reservationUserInfo.time;
    // }

    // userInfo에서 셋팅
    if (userInfo?.gender) {
      switch(userInfo.gender) {
        case 'M':
          newFormData.gender = "male";
          break;
        case 'F':
          newFormData.gender = 'female';
          break;
        default:
          newFormData.gender = 'other';
          break;
      }
    }
    if (userInfo?.id_country) {
      newFormData.nationality = userInfo.id_country;
      // nationality에 해당하는 CountryCode 찾기
      const countryData = country.find(c => c.country_code === userInfo.id_country);
      if (countryData) {
        setNation(countryData);
      }
    }
    if (userInfo?.email) {
      newFormData.email = userInfo.email;
    }
    if (userInfo?.birth_date) {
      newFormData.dateOfBirth = userInfo.birth_date;
      // Parse the birth_date string to Date object
      const parsedDate = new Date(userInfo.birth_date);
      if (!isNaN(parsedDate.getTime())) {
        setBirthDate(parsedDate);
      }
    }

    setFormData(newFormData);
  }, [initialUserData]);

  const handleReservation = (date: string, time: string) => {
    formData.date = date;
    formData.time = time;
    // setReservationInfo({ date, time });
    // const user = useReservationStore.getState().reservationUserInfo;
    // useReservationStore.getState().setReservationUserInfo({
    //   ...user,
    //   date: date,
    //   time: time,
    // });
    // setShowBottomBar(true);
  };
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    try {
      // 폼 데이터 검증
      const newErrors: { [key: string]: string } = {};
      console.log('🔍 Step 1: Starting validation...');
      
      if (!initialUserData?.userInfo?.id_uuid) newErrors.uuid = 'User UUID is required';
      if (!formData.englishName) newErrors.englishName = 'English name is required';
      if (!formData.nationality) newErrors.nationality = 'Nationality is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.koreaPhone) newErrors.koreaPhone = 'Korea phone number is required';
      if (!formData.date) newErrors.date = 'Date is required';
      if (!formData.time) newErrors.time = 'Time is required';
      if (!formData.agreeReservation) newErrors.agreeReservation = 'Please agree to reservation terms';
      // if (!formData.agreeNoShow) newErrors.agreeNoShow = 'Please agree to no-show policy';
      
      console.log('🔍 Step 2: Validation errors:', newErrors);
      console.log('Rservationa aaaaa 2 4 :', initialUserData);
      
      setErrors(newErrors);
      
      console.log('🔍 Step 3: Error count:', Object.keys(newErrors).length);

      if (Object.keys(newErrors).length === 0) {
        console.log('🔍 Step 4: No validation errors, proceeding with API call...');
        
        // API 전송 준비
        const reservationData = {
          date: formData.date,
          time: formData.time,
          id_user: initialUserData?.userInfo?.id_uuid,
          id_uuid_hospital: hospitalId,
          name: formData.englishName,
          english_name: formData.englishName,
          passport_name: formData.passportName,
          nationality: formData.nationality,
          gender: formData.gender as 'male' | 'female' | 'other',
          birth_date: formData.dateOfBirth,
          email: formData.email,
          phone: formData.phoneCountry + ' ' + formData.phoneNumber,
          phone_korea: formData.koreaPhone,
          preferred_date: formData.date,
          preferred_time: formData.time,
          visitor_count: parseInt(formData.visitorsCount) || undefined,
          reservation_headcount: parseInt(formData.reservationCount) || undefined,
          treatment_experience: formData.treatmentExperience === 'true',
          area_to_improve: formData.improvementAreas,
          consultation_request: formData.consultationFor,
          additional_info: formData.treatmentExperience,
          preferred_languages: formData.interpreterLanguage ? [formData.interpreterLanguage] : []
        };

        console.log('🔍 Step 5: Reservation data ready:', reservationData);
        
        const response = await fetch(`/api/hospital/${hospitalId}/reservation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationData),
        });

        console.log('🔍 Step 6: API response received:', response.status);
        
        const data = await response.json();
        console.log('🔍 Step 7: API response data:', data);

        if (response.ok && data.success) {
          console.log("✅ Reservation created successfully:", data.data);
          router.back();
        } else {
          
          console.error("❌ Reservation failed:", data.error);
          alert(data.error || "An error occurred while processing your reservation. Please try again.");
        }
      } else {
        console.log('🔍 Step 4: Validation failed, not submitting');
      }
    } catch (err) {
      console.error("🚨 Error in handleConfirm:", err);
      alert("A network error has occurred. Please check your internet connection and try again.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft className="mr-2" />
              BACK
            </button>
            <h1 className="text-xl font-semibold">ENTER INFO</h1>
            <div className="w-16"></div>
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
            {/* <h2 className="text-lg font-semibold mb-4">Reservation items</h2> */}
            <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                 {/* {hospitalData.hospital_info.thumbnail_url ? ( */}
              <img
                src={hospitalData.hospital_info.thumbnail_url!}
                alt={hospitalData.hospital_info.name_en}
                className="w-full h-full object-cover rounded-lg"
              />
              {/* } */}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{hospitalData.hospital_info.name_en} </h3>
                <p className="text-gray-600 text-sm mt-1">{formData.date}, {formData.time}</p>
                {/* <button className="mt-2 px-4 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  OPTIONS
                </button> */}
              </div>
            </div>
            {/* <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Lifting &amp; Oligio X Package: Includes 100 shots of Oligio X + Cleansing + Sebum Removal (X-Lotion) + Topical Anesthesia + Regeneration Laser &amp; Deposit (20%) x 1
              </p>
            </div> */}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.englishName ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Enter your English name"
                />
                {errors.englishName && <p className="text-red-500 text-sm mt-1">{errors.englishName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => {
                    const selected = country.find((c) => c.country_code === e.target.value);
                    if (selected) {
                      setNation(selected);
                    }
                    handleInputChange('nationality', e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nationality ? 'border-red-300' : 'border-gray-300'}`}
                >
                  <option value="">Select nationality</option>
                  {country.map((item) => (
                    <option key={item.country_code} value={item.country_code}>
                      {item.country_name}
                    </option>
                  ))}
                </select>
                {errors.nationality && (
                  <p className="text-sm text-red-500 mt-1">{errors.nationality}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Ex) 2015550123"
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                <CountrySelectModal
                  open={countryModalOpen}
                  countryList={country}
                  onSelect={(item) => handleInputChange('phoneCountry', `${item.country_name} (+${item.phone_code})`)}
                  onCancel={() => setCountryModalOpen(false)}
                />
              </div>

              <div>
                <ReservationCalendarClient id={hospitalId} onReservation={handleReservation} />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaRegCalendarAlt className="mr-2 text-gray-400" />
                  Date of Birth
                </label>
                <div className="relative">
                  <DatePicker
                    selected={birthDate}
                    onChange={(date: Date | null) => {
                      setBirthDate(date);
                      if (date) {
                        const formattedDate = date.toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric'
                        });
                        handleInputChange('dateOfBirth', formattedDate);
                      } else {
                        handleInputChange('dateOfBirth', '');
                      }
                    }}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    maxDate={new Date()}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    onKeyDown={(e) => {
                      // Prevent manual typing except Tab, Escape and navigation keys
                      const allowedKeys = ['Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                      if (!allowedKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChangeRaw={(e) => {
                      // Prevent any raw input changes
                      e?.preventDefault();
                    }}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please indicate the number of visitors
                </label>
                <input
                  type="number"
                  value={formData.visitorsCount}
                  onChange={(e) => handleInputChange('visitorsCount', e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.koreaPhone ? 'border-red-300' : 'border-red-300'}`}
                />
                {errors.koreaPhone && <p className="text-red-500 text-sm mt-1">{errors.koreaPhone}</p>}
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
              {errors.agreeReservation && <p className="text-red-500 text-sm mt-1">{errors.agreeReservation}</p>}

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

              {/* <div className="flex items-start space-x-3">
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
              {errors.agreeNoShow && <p className="text-red-500 text-sm mt-1">{errors.agreeNoShow}</p>} */}

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

          {/* CONFIRM Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
