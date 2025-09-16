'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface TermItem {
  id: string;
  label: string;
  required: boolean;
}

const terms: TermItem[] = [
  { id: 'age', label: 'Age 14 or older', required: true },
  { id: 'service', label: 'Terms of Service', required: true },
  { id: 'location', label: 'Terms and Conditions of Location-based Services', required: true },
  { id: 'privacy', label: 'Collection and Use of Personal Information', required: true },
  { id: 'marketing', label: 'Leverage marketing and advertising', required: false },
];

export default function TermsClient() {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const isAllRequiredChecked = terms
    .filter(term => term.required)
    .every(term => checkedItems[term.id]);

  const handleAgreeAll = (checked: boolean) => {
    const newCheckedItems = terms.reduce((acc, term) => {
      if (term.required) {
        acc[term.id] = checked;
      }
      return acc;
    }, {} as Record<string, boolean>);
    setCheckedItems(newCheckedItems);
  };

  const handleSingleCheck = (id: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome!</h1>
        <p className="text-gray-600 mt-2">
          In order to use BeautyWell, you need to agree to terms and conditions below.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all"
            checked={isAllRequiredChecked}
            onCheckedChange={(checked) => handleAgreeAll(checked as boolean)}
          />
          <label htmlFor="all" className="font-medium">
            Agree with all (excluding optional)
          </label>
        </div>

        <div className="space-y-4">
          {terms.map((term) => (
            <div key={term.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={term.id}
                  checked={checkedItems[term.id] || false}
                  onCheckedChange={(checked) => handleSingleCheck(term.id, checked as boolean)}
                />
                <label htmlFor={term.id} className="text-sm">
                  {term.required && '[Required] '}{term.label}
                </label>
              </div>
              <Link
                href="/legal/privacy"
                className="text-sm text-blue-600 hover:underline"
              >
                View
              </Link>
            </div>
          ))}
        </div>

        <Button
          className="w-full"
          disabled={!isAllRequiredChecked}
          onClick={() => router.push('/auth/sign-up')}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 