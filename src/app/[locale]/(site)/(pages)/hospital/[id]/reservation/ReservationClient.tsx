'use client';

import { log } from '@/utils/logger';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { FiArrowLeft, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { country } from '@/constants/country';
import CountrySelectModal from '@/components/template/modal/CountrySelectModal';
import { CountryCode } from '@/models/country-code.dto';
import { useReservationStore } from '@/stores/useReservationStore';
import { UserOutputDto } from '@/app/api/auth/getUser/getUser.dto';
import { HospitalDetailMainOutput } from '@/app/api/hospital/[id]/main/main.dto';
import ReservationModal from '@/components/template/modal/ReservationModal';
import ReservationCalendarClient from '@/app/[locale]/(site)/(pages)/hospital/[id]/components/content/ReservationCalendarClient';
import HospitalListCard from '@/app/[locale]/(site)/(pages)/hospital/components/HospitalListCard';
import FitText from '@/components/ui/FitText';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, CheckCircle } from 'lucide-react';

interface ReservationClientProps {
  initialUserData: UserOutputDto | null;
  hospitalId: string;
  hospitalData: HospitalDetailMainOutput;
}

export default function ReservationClient({ initialUserData, hospitalId, hospitalData }: ReservationClientProps) {
  const { goBack } = useNavigation();
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
    preferredLanguages: [] as string[],
    agreeReservation: false,
    agreeNoShow: false,
  

  });

  const [nation, setNation] = useState<CountryCode | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const selectedCountry = country.find(c => `${c.country_name} (+${c.phone_code})` === formData.phoneCountry) || country[0];

  // Zustand store에서 데이터 가져오기
  const reservationUserInfo = useReservationStore.getState().reservationUserInfo;
  
  log.debug("ReservationClient reservationUserInfo", reservationUserInfo);
  log.debug("ReservationClient initialUserData", initialUserData);

  // 컴포넌트 마운트 시 데이터 셋팅
  useEffect(() => {
    const userInfo = initialUserData?.userInfo;
    log.debug('ReservationClient userInfo : ', userInfo);
    if (!userInfo) {
      log.debug("ReservationClient userInfo not found");
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
  
  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    try {
      // 폼 데이터 검증
      const newErrors: { [key: string]: string } = {};
      log.debug('🔍 Step 1: Starting validation...');
      
      if (!initialUserData?.userInfo?.id_uuid) newErrors.uuid = 'User UUID is required';
      if (!formData.englishName) newErrors.englishName = 'English name is required';
      if (!formData.nationality) newErrors.nationality = 'Nationality is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      // if (!formData.koreaPhone) newErrors.koreaPhone = 'Korea phone number is required';
      if (!formData.date) newErrors.date = 'Date is required';
      if (!formData.time) newErrors.time = 'Time is required';
      if (formData.preferredLanguages.length === 0) newErrors.preferredLanguages = 'Please select at least one language option';
      // if (!formData.agreeReservation) newErrors.agreeReservation = 'Please agree to reservation terms';
      // if (!formData.agreeNoShow) newErrors.agreeNoShow = 'Please agree to no-show policy';
      
      log.debug('🔍 Step 2: Validation errors:', newErrors);
      log.debug('Rservationa aaaaa 2 4 :', initialUserData);
      
      setErrors(newErrors);
      
      log.debug('🔍 Step 3: Error count:', Object.keys(newErrors).length);

      if (Object.keys(newErrors).length === 0) {
        log.debug('🔍 Step 4: No validation errors, proceeding with API call...');

        setIsSubmitting(true);

        try {
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
            phone_korea: formData.koreaPhone || undefined,
            preferred_date: formData.date,
            preferred_time: formData.time,
            visitor_count: formData.visitorsCount || undefined,
            reservation_headcount: formData.reservationCount || undefined,
            treatment_experience: formData.treatmentExperience || undefined,
            area_to_improve: formData.improvementAreas,
            consultation_request: formData.consultationFor,
            additional_info: formData.treatmentExperience,
            preferred_languages: formData.preferredLanguages
          };

          log.debug('🔍 Step 5: Reservation data ready:', reservationData);

          const response = await fetch(`/api/hospital/${hospitalId}/reservation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reservationData),
          });

          log.debug('🔍 Step 6: API response received:', response.status);

          const data = await response.json();
          log.debug('🔍 Step 7: API response data:', data);

          if (response.ok && data.success) {
            log.debug("✅ Reservation created successfully:", data.data);
            setShowSuccessModal(true);
          } else {
            console.error("❌ Reservation failed:", data.error);
            alert(data.error || "An error occurred while processing your reservation. Please try again.");
          }
        } catch (err) {
          console.error("🚨 Error in API call:", err);
          alert("A network error has occurred. Please check your internet connection and try again.");
        } finally {
          setIsSubmitting(false);
        }
      } else {
        log.debug('🔍 Step 4: Validation failed, not submitting');
      }
    } catch (err) {
      console.error("🚨 Error in handleConfirm:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // const handleBack = () => {
  //   goBack();
  // };

  return (
    <>
      <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            {/* <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft className="mr-2" />
              BACK
            </button> */}
            <FitText
              className="flex-1 mx-4 font-semibold"
              minFontSize={14}
              maxFontSize={20}
            >
              ENTER INFO FOR RESERVATION
            </FitText>
            <div className="w-16"></div>
          </div>
        </div>

        {/* Warning Banner */}
        {/* <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center max-w-4xl mx-auto">
            <FiAlertTriangle className="text-yellow-600 mr-3 text-xl" />
            <span className="text-yellow-800 font-medium">
              We don&apos;t have many spots left. Reserve now!
            </span>
          </div>
        </div> */}

        <div className="max-w-4xl mx-auto pb-8 px-4 w-full box-border">
          {/* Reservation Items */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 w-full box-border">
            {/* <h2 className="text-lg font-semibold mb-4">Reservation items</h2> */}
            <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg w-full box-border">
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
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 w-full box-border">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4 w-full">
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
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 w-full box-border">
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4 w-full">
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
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 focus:ring-2 focus:ring-blue-500",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      {birthDate ? format(birthDate, 'MM/dd/yyyy') : 'mm/dd/yyyy'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start" avoidCollisions={true} sideOffset={5}>
                    <CalendarComponent
                      mode="single"
                      selected={birthDate || undefined}
                      onSelect={(date) => {
                        setBirthDate(date || null);
                        setIsCalendarOpen(false);
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
                      disabled={(date) => date > new Date()}
                      defaultMonth={birthDate || new Date()}
                      className="p-0"
                      classNames={{
                        months: "flex flex-col sm:flex-row p-0",
                        month: "space-y-4 p-0",
                        caption: "flex justify-center pt-1 pb-2 relative",
                        caption_label: "text-sm font-medium",
                        nav: "flex items-center gap-1",
                        nav_button: cn(
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        ),
                        nav_button_previous: "",
                        nav_button_next: "",
                        table: "w-full border-collapse p-0",
                        head_row: "flex w-full",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1 flex items-center justify-center",
                        row: "flex w-full mt-2",
                        cell: "flex-1 text-center text-sm p-0 relative",
                        day: cn(
                          "h-9 w-9 p-0 font-normal mx-auto"
                        ),
                        day_disabled: "!text-gray-400 !opacity-40 !cursor-not-allowed hover:!bg-transparent",
                        day_outside: "text-gray-300 opacity-50",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                   How many people are in the reservation?
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.reservationCount}
                  onChange={(e) => handleInputChange('reservationCount', e.target.value)}
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
                  Please describe your experience with this treatment.
                  {`(e.g., 'I've tried it before in Korea', 'I've only heard about it', 'This is my first time')`}
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
                Contact number available during your visit
                <span className="text-gray-500 text-xs ml-2">(Optional)</span>
              </label>
                <input
                  type="tel"
                  value={formData.koreaPhone}
                  onChange={(e) => handleInputChange('koreaPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex) your roaming number or +82 10-1234-5678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 roaming number, Korean number, or any number we can reach you on your visit date
                </p>
              </div>

              {/* <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.agreeReservation}
                  onChange={(e) => handleInputChange('agreeReservation', e.target.checked)}
                  className="mt-1"
                />
                <label className="text-sm text-gray-700">
                  Please make the same amount of reservations as the amount of people that will be receiving procedures. (One person can make reservation for 2 or more products.)
                </label>
              </div> */}
              {/* {errors.agreeReservation && <p className="text-red-500 text-sm mt-1">{errors.agreeReservation}</p>} */}

              {/* <div>
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
              </div> */}

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

              {/* <p className="text-red-500 text-sm">You must accept the terms and conditions to proceed.</p> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which language interpreters do you need? (Select in order of priority, max 3) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Click languages in your preferred order. Numbers show priority.
                </p>

                {/* 선택된 언어 실시간 표시 */}
                {formData.preferredLanguages.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-2">Your selection:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.preferredLanguages.map((langValue, index) => {
                        const langLabel = [
                          { value: 'en', label: 'English' },
                          { value: 'ja', label: '日本語' },
                          { value: 'zh-CN', label: '简体中文' },
                          { value: 'zh-TW', label: '繁體中文' },
                          { value: 'th', label: 'ภาษาไทย' },
                          { value: 'ko', label: '한국어' },
                          { value: 'none', label: 'No interpreter needed' }
                        ].find(l => l.value === langValue)?.label;

                        return (
                          <span key={langValue} className="text-sm font-medium text-blue-700">
                            {index + 1}. {langLabel}
                            {index < formData.preferredLanguages.length - 1 && <span className="ml-1">→</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {[
                    { value: 'en', label: 'English' },
                    { value: 'ja', label: '日本語' },
                    { value: 'zh-CN', label: '简体中文' },
                    { value: 'zh-TW', label: '繁體中文' },
                    { value: 'th', label: 'ภาษาไทย' },
                    { value: 'ko', label: '한국어' },
                    { value: 'none', label: 'No interpreter needed' }
                  ].map((lang) => {
                    const priorityIndex = formData.preferredLanguages.indexOf(lang.value);
                    const isSelected = priorityIndex !== -1;
                    const isNoneOption = lang.value === 'none';
                    const hasNoneSelected = formData.preferredLanguages.includes('none');
                    const isMaxSelected = formData.preferredLanguages.length >= 3;

                    // 비활성화 조건:
                    // 1. 3개 선택되었고 현재 항목이 선택되지 않은 경우
                    // 2. "No interpreter needed"가 선택되어 있고 현재 항목이 그것이 아닌 경우
                    const isDisabled = (!isSelected && isMaxSelected) || (!isNoneOption && hasNoneSelected);

                    return (
                      <label
                        key={lang.value}
                        className={cn(
                          "flex items-center gap-3 p-4 border-2 rounded-lg transition-all",
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : isDisabled
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                            : "border-gray-200 hover:border-gray-300 cursor-pointer"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => {
                            let newLanguages = [...formData.preferredLanguages];

                            if (e.target.checked) {
                              // "No interpreter needed" 선택 시 다른 모든 항목 해제
                              if (isNoneOption) {
                                newLanguages = ['none'];
                              } else {
                                // 다른 항목 선택 시 "No interpreter needed" 자동 해제
                                newLanguages = newLanguages.filter(v => v !== 'none');
                                newLanguages.push(lang.value);
                              }
                            } else {
                              // 체크 해제: 배열에서 제거
                              const index = newLanguages.indexOf(lang.value);
                              if (index > -1) {
                                newLanguages.splice(index, 1);
                              }
                            }

                            handleInputChange('preferredLanguages', newLanguages);
                            // 에러 클리어
                            if (newLanguages.length > 0 && errors.preferredLanguages) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.preferredLanguages;
                                return newErrors;
                              });
                            }
                          }}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={cn(
                          "flex-1 text-sm font-medium",
                          isDisabled ? "text-gray-400" : "text-gray-700"
                        )}>
                          {lang.label}
                        </span>
                        {isSelected && (
                          <span className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white text-sm font-bold rounded-full">
                            {priorityIndex + 1}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {errors.preferredLanguages && (
                  <p className="text-red-500 text-sm mt-2">{errors.preferredLanguages}</p>
                )}
              </div>
            </div>
          </div>

          {/* CONFIRM Button */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 w-full box-border">
            <button
              onClick={handleConfirm}
              disabled={
                isSubmitting ||
                !formData.englishName ||
                !formData.nationality ||
                !formData.email ||
                !formData.phoneNumber ||
                !formData.date ||
                !formData.time ||
                formData.preferredLanguages.length === 0
              }
              className={cn(
                "w-full py-4 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2",
                isSubmitting ||
                !formData.englishName ||
                !formData.nationality ||
                !formData.email ||
                !formData.phoneNumber ||
                !formData.date ||
                !formData.time ||
                formData.preferredLanguages.length === 0
                  ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>CONFIRM</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Reservation Completed Successfully!
              </h3>
              <p className="text-sm text-gray-600">
                Reservation completed successfully. You can check your reservation status on My Page.
              </p>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                goBack();
              }}
              className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-2 rounded-full font-semibold transition-all"
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
