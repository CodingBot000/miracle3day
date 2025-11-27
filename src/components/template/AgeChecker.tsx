'use client';

import { useState } from 'react';

export default function AgeChecker() {
  const [url, setUrl] = useState('');
  const [ageResult, setAgeResult] = useState<any>(null);
  
  const handleSubmit = async () => {
    // const res = await fetch('/api/ai/everypixel/estimate_age', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ imageUrl: url }),
    // });

    // const data = await res.json();
    // setAgeResult(data);
    const res = await fetch('/api/ai/everypixel/estimate_age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl:
            'https://tqyarvckzieoraneohvv.backendClient.co/storage/v1/object/public/images/images/doctors/95cc2bb6-c42c-42e0-a625-b5ef60025054/doctor_fffff_3e01f3f3_1753445190187.png',
        }),
      });
    
      const json = await res.json();
      log.debug('결과:', json);
      
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border px-2 py-1"
      />
      <button onClick={handleSubmit} className="ml-2 px-4 py-1 bg-blue-500 text-white">
        Check Age
      </button>
      {ageResult && (
        <pre className="mt-4 bg-gray-100 p-2">{JSON.stringify(ageResult, null, 2)}</pre>
      )}
    </div>
  );
}