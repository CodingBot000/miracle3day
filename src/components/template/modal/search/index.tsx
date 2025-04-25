"use client";

import { ModalOverlay } from "@/components/organism/layout/modal/overlay";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { ChangeEventHandler, useState } from "react";
import {
  CountryCode,
  CountryOutputDto,
} from "@/app/api/auth/countryCode/country-code";

export interface SearchModalProps {
  open: boolean;
  itemList: CountryOutputDto["countryCode"];
  onClick: (value: CountryCode) => void;
  onCancel: () => void;
}

export const SearchModal = ({
  open,
  onClick,
  onCancel,
  itemList,
}: SearchModalProps) => {
  const [searchList, setSearchList] = useState<typeof itemList>(itemList);

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const search = e.target.value.toLowerCase();
    const findItem = itemList.filter(({ country_name }) => {
      const item = country_name.toLowerCase();
      return item.includes(search);
    });
    setSearchList(findItem);
  };

  const handleSelect = (item: CountryCode) => {
    onClick(item);
    onCancel();
  };

  const handleCloseModal = () => {
    setSearchList(itemList);
    onCancel();
  };

  return (
    <ModalOverlay open={open} handleClick={handleCloseModal}>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search country"
            name="search"
            onChange={handleOnChange}
            autoFocus
            autoComplete="off"
          />
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {searchList.map((item, i) => (
              <div
                key={i}
                className="p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                onClick={() => handleSelect(item)}
              >
                {item.country_name}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </ModalOverlay>
  );
};
