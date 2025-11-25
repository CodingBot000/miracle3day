import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import CountryCodeSelector from "./CountryCodeSelector"
import { CountryCode } from "@/app/models/country-code.dto"

export type MessengerType = "instagram" | "line" | "kakaotalk" | "whatsapp" | "tiktok" | "wechat"

export type MessengerInput = {
  type: MessengerType
  value: string
  country_name?: string // For WhatsApp only
  country_code?: string // For WhatsApp only  
  phone_code?: string // For WhatsApp only
}

interface InputMessengerFieldsProps {
  value?: MessengerInput[];
  onChange: (messengers: MessengerInput[]) => void;
}

const PLACEHOLDER: Record<MessengerType, string> = {
  instagram: "Enter your Instagram username (e.g., beautylover2025)",
  line: "Enter your LINE ID (e.g., beauty_line88)",
  kakaotalk: "Enter your KakaoTalk ID or phone number",
  whatsapp: "Enter your phone number including country code (e.g., +821012345678)",
  tiktok: "Enter your TikTok username (e.g., @beauty_tips)",
  wechat: "Enter your WeChat ID (e.g., wechat_id123)",
};

export default function InputMessengerFields({ value = [], onChange }: InputMessengerFieldsProps) {
  const [messengerInputs, setMessengerInputs] = useState<MessengerInput[]>([
    { type: "instagram", value: "" },
  ])

  useEffect(() => {
    if (value.length > 0) {
      setMessengerInputs(value);
    }
  }, [value]);

  const handleMessengerTypeChange = (index: number, nextType: MessengerType) => {
    const defaultKoreaCountry = { country_name: "South Korea", country_code: "KR", phone_code: "82" };
    
    const updatedInputs = messengerInputs.map((row, i) => 
      i === index ? { 
        ...row, 
        type: nextType,
        // Add default Korean country info for WhatsApp
        ...(nextType === "whatsapp" ? defaultKoreaCountry : {
          country_name: undefined,
          country_code: undefined, 
          phone_code: undefined
        })
      } : row
    );
    setMessengerInputs(updatedInputs);
    
    // Send all messenger inputs to parent (including empty ones)
    onChange(updatedInputs);
  }

  const handleMessengerValueChange = (index: number, nextValue: string) => {
    const updatedInputs = messengerInputs.map((row, i) => 
      i === index ? { ...row, value: nextValue } : row
    );
    setMessengerInputs(updatedInputs);
    
    // Send all messenger inputs to parent (including empty ones)
    onChange(updatedInputs);
  }

  const handleCountryCodeChange = (index: number, country: CountryCode) => {
    const updatedInputs = messengerInputs.map((row, i) => 
      i === index ? { 
        ...row, 
        country_name: country.country_name,
        country_code: country.country_code,
        phone_code: country.phone_code
      } : row
    );
    setMessengerInputs(updatedInputs);
    
    // Send all messenger inputs to parent (including empty ones)
    onChange(updatedInputs);
  }

  const addMessengerRow = () => {
    const updatedInputs = [...messengerInputs, { type: "instagram" as MessengerType, value: "" }];
    setMessengerInputs(updatedInputs);
    // Don't call onChange here - only update when value is entered
  }

  const removeMessengerRow = (index: number) => {
    const updatedInputs = messengerInputs.filter((_, i) => i !== index);
    setMessengerInputs(updatedInputs);
    
    // Send all messenger inputs to parent (including empty ones)
    onChange(updatedInputs);
  }

  return (
    <div className="space-y-3">
      <Label className="text-gray-700 font-medium">Please provide at least one messaging app for real-time communication (e.g., WhatsApp, Instagram DM, KakaoTalk).</Label>

      <div className="space-y-3">
        {messengerInputs.map((row, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-1">
            {/* 왼쪽: shadcn Select */}
            <div className="sm:col-span-4">
              <Select
                value={row.type}
                onValueChange={(v: string) =>
                  handleMessengerTypeChange(index, v as MessengerType)
                }
              >
                <SelectTrigger
                  className="w-full border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
                  translate="no"
                >
                  <SelectValue
                    placeholder="Select messenger"
                    // SelectValue가 렌더하는 텍스트도 번역 방지
                    aria-label={row.type}
                  />
                </SelectTrigger>
                <SelectContent translate="no" className="notranslate">
                  <SelectItem value="instagram">
                    <span translate="no" className="notranslate">Instagram</span>
                  </SelectItem>
                  <SelectItem value="line">
                    <span translate="no" className="notranslate">LINE</span>
                  </SelectItem>
                  <SelectItem value="kakaotalk">
                    <span translate="no" className="notranslate">KakaoTalk</span>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <span translate="no" className="notranslate">WhatsApp</span>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <span translate="no" className="notranslate">Tiktok</span>
                  </SelectItem>
                    <SelectItem value="wechat">
                    <span translate="no" className="notranslate">WeChat</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* WhatsApp용 국가 코드 선택 또는 일반 입력창 */}
            {row.type === "whatsapp" ? (
              <>
                {/* 국가 코드 선택 */}
                <div className="sm:col-span-2">
                  <CountryCodeSelector
                    selectedCountry={row.country_name ? {
                      country_name: row.country_name,
                      country_code: row.country_code!,
                      phone_code: row.phone_code!
                    } : undefined}
                    onSelect={(country) => handleCountryCodeChange(index, country)}
                  />
                </div>
                {/* WhatsApp 전화번호 입력 */}
                <div className="sm:col-span-5">
                  <Input
                    value={row.value}
                    onChange={(e) => handleMessengerValueChange(index, e.target.value)}
                    className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
                    placeholder={`Phone number${index === 0 ? " (Required)" : ""}`}
                    required={index === 0}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                  />
                </div>
              </>
            ) : (
              /* 일반 메신저 입력창 */
              <div className="sm:col-span-7">
                <Input
                  value={row.value}
                  onChange={(e) => handleMessengerValueChange(index, e.target.value)}
                  className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
                  placeholder={`${PLACEHOLDER[row.type]}${
                    index === 0 ? " (Required)" : ""
                  }`}
                  required={index === 0}
                  inputMode="text"
                  autoComplete="off"
                />
              </div>
            )}

            {/* 삭제 버튼 */}
            <div className="sm:col-span-1 flex items-center justify-end">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeMessengerRow(index)}
                  className="w-6 h-6 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center text-rose-500 hover:text-rose-600 transition-colors"
                  aria-label={`Remove messenger ${index + 1}`}
                >
                  −
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <Button type="button" variant="outline" onClick={addMessengerRow}>
          + Add Messenger
        </Button>
      </div>
    </div>
  )
}
