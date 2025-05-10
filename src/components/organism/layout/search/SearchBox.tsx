"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getSearchAPI } from "@/app/api/search";
import { SearchItem } from "@/app/api/search/search.dto";



export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      const fetchData = async () => {
        setLoading(true);

        try {
          const response = await getSearchAPI(query);
          setResults(response.data ?? []);
        } catch (error) {
          console.error("Error fetching data:", error);
          setResults([]);
        } finally {
          setLoading(false);
        };
        
      };

      fetchData();  
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Input
        placeholder="시술명, 병원명, 지역으로 검색하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <Skeleton className="h-10 mt-2" />}

      {!loading && results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg">
          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/hospital/${item.id_unique}`)}
              className="px-4 py-2 hover:bg-muted cursor-pointer"
            >
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.location}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
