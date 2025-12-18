'use client';

import { useEffect, useState } from 'react';

interface Bucket {
  name: string;
  creationDate: string;
}

interface BucketSelectorProps {
  selectedBucket: string | null;
  onBucketChange: (bucket: string) => void;
}

export default function BucketSelector({
  selectedBucket,
  onBucketChange,
}: BucketSelectorProps) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/storage/buckets');

      if (!response.ok) {
        throw new Error('Failed to fetch buckets');
      }

      const data = await response.json();
      setBuckets(data.buckets);

      // 자동으로 첫 번째 버킷 선택
      if (data.buckets.length > 0 && !selectedBucket) {
        onBucketChange(data.buckets[0].name);
      }
    } catch (err) {
      console.error('Error fetching buckets:', err);
      setError('버킷 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">버킷 목록 로딩 중...</div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">{error}</div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="bucket-select" className="text-sm font-medium text-gray-700">
        버킷:
      </label>
      <select
        id="bucket-select"
        value={selectedBucket || ''}
        onChange={(e) => onBucketChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {buckets.map((bucket) => (
          <option key={bucket.name} value={bucket.name}>
            {bucket.name}
          </option>
        ))}
      </select>
    </div>
  );
}
