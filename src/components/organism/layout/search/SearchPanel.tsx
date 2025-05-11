"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { getSearchAPI } from "@/app/api/search";
import { SearchItem } from "@/app/api/search/search.dto";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { EventCard, HospitalCard, ReviewCard } from "@/components/molecules/card";
import { ROUTE } from "@/router";
import { Skeleton } from "@/components/ui/skeleton";
import { daysYMDFormat } from "@/utils/days";

export default function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const recommendedKeywords = ["Botox", "Ulthera", "Hair Transplantation", "Laser Lifting","Thermage", "InMode", "Shrink", "Filler"];
  const trendingKeywords = ["Re-One", "Gangnam", "Laser Lifting", "Chungdam", "Apgujung"];

const handleKeywordClick = (word: string) => {
  setQuery(word);
  // 바로 제출하려면 이 함수에서 검색 submit 트리거 호출
  // handleSearch(word); ← 존재한다면 호출
};

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query.trim()) return;

      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await getSearchAPI(query);
          console.log("response.data:", response.data);
          console.log("typeof results", typeof response.data);
console.log("Array.isArray", Array.isArray(response.data));
          setResults(response.data);
        } catch (err) {
          console.error(err);
          setResults(undefined);
        } finally {
          console.log("finally");
          setLoading(false);
        }
      };

      fetchData();
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);


  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Searching...</div>
    );
  }

  if (!results) {
    return null; 
  }

  const styleConteList = "grid gap-4 mx-4 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-3 md:gap-6 md:mx-auto md:max-w-[1024px] md:h-auto";

  return (
    <div className="fixed top-[88px] left-0 w-full h-[calc(100vh-88px)] bg-white z-30 p-4 overflow-auto">
      <div className="flex justify-center mb-4">
        <div className="flex w-full max-w-[500px] items-center">
          <Input
            placeholder="Search by treatment, clinic, location, or event name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow"
          />
          <button onClick={onClose} className="ml-2 p-2 text-gray-500 hover:text-black">
            <X />
          </button>
        </div>
      </div>

      <div className="mb-4">
  <div className="text-sm font-medium text-gray-700 mb-2">Recommended</div>
  <div className="flex flex-wrap gap-2">
    {recommendedKeywords.map((word) => (
      <button
        key={word}
        onClick={() => handleKeywordClick(word)}
        className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm"
      >
        {word}
      </button>
    ))}
  </div>
</div>

  <div className="mb-4">
    <div className="text-sm font-medium text-gray-700 mb-2">Trending</div>
    <div className="flex flex-wrap gap-2">
      {trendingKeywords.map((word) => (
        <button
          key={word}
          onClick={() => handleKeywordClick(word)}
          className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm"
        >
          {word}
        </button>
      ))}
    </div>
  </div>

      <div className="w-full">
      {/* <div className={styleConteList}>
        {(
          <> */}
          {results.hospitals.length > 0 && (
             <div className="col-span-full text-2xl font-semibold text-gray-800 mt-16 mb-5">
                 Hospital
            </div>
            )}
      <div className={styleConteList}>
        {(
          <>
              {results.hospitals.map(({ imageurls, name, id_unique, location }) => (
                  <div key={id_unique}>
                    <HospitalCard
                      alt={name}
                      name={name}
                      href={ROUTE.HOSPITAL_DETAIL("") + id_unique}
                      src={imageurls[0]}
                      locationNum={location}
                    />
                  </div>
                ))}
            </>
          )
        }
        </div>
        {results.events.length > 0 && (

          <div className="col-span-full text-2xl font-semibold text-gray-800 mt-16 mb-5">
              Events
          </div>
        )}
        <div className={styleConteList}>
          {results.events.map(({ description, imageurls, name, id_unique, date_from, date_to, price }) => (
              <div key={id_unique}>
                <EventCard
                  layout="responsive"
                  href={ROUTE.EVENT_DETAIL("") + id_unique}
                  src={imageurls?.[0]}
                  title={name}
                  date={`${daysYMDFormat(date_from)} ~ ${daysYMDFormat(date_to)}`}
                  price={price}
                  desc={description}
                  alt={name}
                />
              </div>
            ))}
        </div>
        {results.reviews.length > 0 && (
          // <>
          <div className="col-span-full text-2xl font-semibold text-gray-800 mt-16 mb-5">
              Reviews
          </div>
        )}
          <div className={styleConteList}>
          {results.reviews.map((review) => (
            <div
              key={review.id_unique}
              className="md:min-w-[280px] md:max-w-[280px] flex-shrink-0"
            >
              <ReviewCard
                src={review.reviewimageurls?.[0]}
                alt="thumbnail"
                content={review.description}
                id={review.user?.nickname || ""}
                name={review.hospital?.name || ""}
                created_at={review.created_at}
              />
            </div>
          ))}
          </div>
        
      </div>

      {!loading && query && results && results.hospitals.length === 0 && results.events.length === 0 && results.reviews.length === 0 && (
        <div className="text-sm text-muted-foreground">Search results not found</div>
      )}
    </div>
      
    
    // </div>
  );
}
