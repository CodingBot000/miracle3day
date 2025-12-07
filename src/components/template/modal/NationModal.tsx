"use client";

import { SearchModal } from "@/components/template/modal";
import { country } from "@/constants/country";
import useModal from "@/hooks/useModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { CountryCode } from "@/models/country-code.dto";

interface NationModalProps {
  nation: string;
  onSelect: (value: CountryCode) => void;
}

export const NationModal = ({ nation, onSelect }: NationModalProps) => {
  const { handleOpenModal, open } = useModal();
  // const [nationality, setNationality] = useState<string>("");

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="nationality"
          name="nationality"
          readOnly
          value={nation}
          onFocus={handleOpenModal}
          placeholder="Select your nationality"
          className="pl-10 cursor-pointer"
        />
      </div>
      <SearchModal
        open={open}
        itemList={country}
        onCancel={handleOpenModal}
        onClick={onSelect}
      />
    </div>
  );
};
