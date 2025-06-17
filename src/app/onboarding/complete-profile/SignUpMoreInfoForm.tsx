  "use client";

  import { useState, useMemo, useEffect } from "react";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";
  import { clsx } from "clsx";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
  import { NationModal } from "@/app/auth/sign-up/components/modal/nations";
  import { useSearchParams } from "next/navigation";

  interface SignUpMoreInfoFormProps {
    onSubmit: (data: {
      name: string;
      birthDate: string;
      gender: "F" | "M";
      country: string;
      email: string;
    }) => void;
  }

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const MINIMUM_AGE = 14;

  // export default function SignUpMoreInfoForm({ onSubmit }: SignUpMoreInfoFormProps) {
  export default function SignUpMoreInfoForm() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    console.log('code:', code); // 예: 454551e2-e1b5-449a-9dc0-7282aa0fc5cc

    useEffect(() => {
      if (code) {
        console.log('code:', code);
      }
      // const fetchData = async () => {
      //   setLoading(true);
      //   try {
      //     const response = await getSearchAPI(query);
      //     setResults(response.data);
      //   } catch (err) {
      //     console.error(err);
      //     setResults(undefined);
      //   } finally {
      //     setLoading(false);
      //   }
      // };

      // fetchData();
    }, [code]);

    const [formData, setFormData] = useState({
      displayName: "",
      fullName: "",
      birthMonth: "",
      birthDay: "",
      birthYear: "",
      gender: "F" as "F" | "M",
      country: "",
      email: "",
    });

    const [formError, setFormError] = useState<{ [key: string]: string }>({});
    const [nation, setNation] = useState<string>("");

    // Generate arrays for days and years
    const years = useMemo(() => {
      const currentYear = new Date().getFullYear();
      const maxYear = currentYear - MINIMUM_AGE; // Latest year for 14-year-olds
      const startYear = currentYear - 100; // Assuming maximum age of 100
      return Array.from(
        { length: maxYear - startYear + 1 }, 
        (_, i) => maxYear - i
      ).sort((a, b) => b - a); // Sort years in descending order
    }, []);

    const days = useMemo(() => {
      return Array.from({ length: 31 }, (_, i) => i + 1);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: { [key: string]: string } = {};

      if (!formData.displayName.trim()) {
        newErrors.name = "Please enter your name";
      }
      if (!formData.birthMonth || !formData.birthDay || !formData.birthYear) {
        newErrors.birthDate = "Please enter your birth date";
      }
      if (!formData.country) {
        newErrors.country = "Please select your country";
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setFormError(newErrors);
        return;
      }

      // Format birthDate as YYYYMMDD before submitting
      const monthIndex = MONTHS.indexOf(formData.birthMonth) + 1;
      const formattedMonth = monthIndex.toString().padStart(2, '0');
      const formattedDay = formData.birthDay.toString().padStart(2, '0');
      
      const formattedData = {
        ...formData,
        birthDate: `${formData.birthYear}${formattedMonth}${formattedDay}`,
      };
      // user 테이블에서 uuid로 찾아서 컬럼 업데이트 하기 
      console.log('Submitting:', formattedData);
    };

    return (
      <main className="w-full max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold mb-6">Additional Information</h1>
        <p className="text-sm text-gray-400 mb-1">
            This is the name that will appear on your profile. It doesn’t have to be your real name.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name(Required)</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, displayName: e.target.value }));
                setFormError((prev) => ({ ...prev, name: "" }));
              }}
              className={clsx({ "border-red-500": formError.displayName })}
              placeholder="Enter your display name"
            />
            {formError.displayName && <p className="text-sm text-red-500">{formError.displayName}</p>}
          </div>

          <div className="space-y-2">
          <p className="text-sm text-gray-400 mb-1">
          Used only for medical consultations or appointment records, and never shared publicly.
        </p>
            <Label htmlFor="fullName">Full Name (Optional)</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                setFormError((prev) => ({ ...prev, name: "" }));
              }}
              className={clsx({ "border-red-500": formError.fullName })}
              placeholder="Enter your full name"
            />
            {formError.fullName && <p className="text-sm text-red-500">{formError.fullName}</p>}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-400 mb-1">
              If you provide your exact date of birth, we can offer more personalized recommendations and consultations.
            </p>
            
            <Label>Birth Date</Label>
            <div className="grid grid-cols-3 gap-2">
              {/* Month Select */}
              <Select
                value={formData.birthMonth}
                onValueChange={(value: string) => {
                  setFormData(prev => ({ ...prev, birthMonth: value }));
                  setFormError(prev => ({ ...prev, birthDate: "" }));
                }}
              >
                <SelectTrigger className={clsx({ "border-red-500": formError.birthDate })}>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Day Select */}
              <Select
                value={formData.birthDay}
                onValueChange={(value: string) => {
                  setFormData(prev => ({ ...prev, birthDay: value }));
                  setFormError(prev => ({ ...prev, birthDate: "" }));
                }}
              >
                <SelectTrigger className={clsx({ "border-red-500": formError.birthDate })}>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Select */}
              <Select
                value={formData.birthYear}
                onValueChange={(value: string) => {
                  setFormData(prev => ({ ...prev, birthYear: value }));
                  setFormError(prev => ({ ...prev, birthDate: "" }));
                }}
              >
                <SelectTrigger className={clsx({ "border-red-500": formError.birthDate })}>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError.birthDate && <p className="text-sm text-red-500">{formError.birthDate}</p>}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-400 mb-1">
              Optimized treatment recommendations vary depending on your gender.
            </p>
            <Label>Gender</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value: "F" | "M") => setFormData((prev) => ({ ...prev, gender: value }))}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="F" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="M" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
            </RadioGroup>
          </div>

          {/* <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value: string) => {
                setFormData((prev) => ({ ...prev, country: value }));
                setFormError((prev) => ({ ...prev, country: "" }));
              }}
            >
              <SelectTrigger className={clsx({ "border-red-500": formError.country })}>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KR">South Korea</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
                <SelectItem value="CN">China</SelectItem>

              </SelectContent>
            </Select>
            {formError.country && <p className="text-sm text-red-500">{formError.country}</p>}
          </div> */}
          <div className="space-y-2">
          <div className="w-full my-2">
            <NationModal nation={nation} onSelect={(value) => setNation(value)} />
            <input type="hidden" name="nation" value={nation} />
            {formError?.nation?.length && (
              <p className="text-sm text-red-500 mt-1">{formError.nation[0]}</p>
            )}
          </div>
          </div>


          <div className="space-y-2">
            <path className="text-sm text-gray-400 mb-1">
            If you signed up using social login, you can optionally provide a secondary email if you`&apos;`d like to receive additional information.
            </path>
            <Label htmlFor="email">Sub Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                setFormError((prev) => ({ ...prev, email: "" }));
              }}
              className={clsx({ "border-red-500": formError.email })}
              placeholder="Enter your email(optional)"
            />
            {formError.email && <p className="text-sm text-red-500">{formError.email}</p>}
          </div>

          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </main>
    );
  }
