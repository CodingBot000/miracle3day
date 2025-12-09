import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { country } from '@/constants/country';
import { CountryCode } from '@/models/country-code.dto';

interface CountryCodeSelectorProps {
  selectedCountry?: CountryCode;
  onSelect: (country: CountryCode) => void;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCountry,
  onSelect
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Default to South Korea if no country selected
  const defaultCountry = country.find(c => c.phone_code === "82") || country[0];
  const currentCountry = selectedCountry || defaultCountry;

  const filteredCountries = country.filter(c => 
    c.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_code.includes(searchTerm)
  );

  const handleSelect = (countryData: CountryCode) => {
    onSelect(countryData);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-20 border-rose-200 hover:bg-rose-50 text-sm px-2"
      >
        +{currentCountry.phone_code}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Country Code</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search country or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-1">
                {filteredCountries.map((countryData) => (
                  <button
                    key={countryData.id}
                    onClick={() => handleSelect(countryData)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-rose-50 rounded-md text-left transition-colors"
                  >
                    <span className="font-medium">{countryData.country_name}</span>
                    <span className="text-rose-600 font-mono">+{countryData.phone_code}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CountryCodeSelector;