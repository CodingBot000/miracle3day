"use client";

import React, { useEffect, useRef, useState, ChangeEventHandler } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { CountryCode } from "@/models/country-code.dto";

interface CountrySelectModalProps {
  open: boolean;
  countryList: CountryCode[];
  onSelect: (country: CountryCode) => void;
  onCancel: () => void;
}

export const CountrySelectModal = ({ open, countryList, onSelect, onCancel }: CountrySelectModalProps) => {
  const [searchList, setSearchList] = useState(countryList);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearchList(countryList);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, countryList]);

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const search = e.target.value.toLowerCase();
    const filtered = countryList.filter(({ country_name, phone_code }) =>
      country_name.toLowerCase().includes(search) ||
      phone_code.replace(/[^0-9]/g, '').includes(search.replace(/[^0-9]/g, ''))
    );
    setSearchList(filtered);
  };

  const handleSelect = (item: CountryCode) => {
    onSelect(item);
    onCancel();
  };

  const onClose = () => {
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent className="[&>button]:hidden max-w-md sm:rounded-xl animate-in fade-in-0 zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Select Country</DialogTitle>
          <DialogClose onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              className="pl-10"
              placeholder="Search country or code"
              name="search"
              onChange={handleOnChange}
              autoComplete="off"
            />
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {searchList.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100"
                  onClick={() => handleSelect(item)}
                >
                  <span className="font-medium text-gray-800">{item.country_name}</span>
                  <span className="text-gray-500 ml-4">+{item.phone_code}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CountrySelectModal; 