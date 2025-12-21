export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { q } from "@/lib/db";
import {
  TABLE_TREATMENTS_ROOT,
  TABLE_HOSPITAL,
  TABLE_TREATMENT_PRODUCT,
} from "@/constants/tables";
import type {
  TreatmentResult,
  HospitalResult,
  ProductResult,
} from "@/models/search";
import { getCurrencyInfo } from "@/utils/exchangeRate";

type Props = {
  params: {
    locale: string;
  };
  searchParams: {
    q?: string;
  };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = searchParams.q?.trim() || "";
  return {
    title: query ? `Search: ${query} | Beauty Well` : "Search | Beauty Well",
    description: `Search results for "${query}" on Beauty Well`,
  };
}

async function searchDatabase(query: string) {
  if (!query) {
    return {
      treatments: [] as TreatmentResult[],
      hospitals: [] as HospitalResult[],
      products: [] as ProductResult[],
    };
  }

  const searchPattern = `%${query}%`;
  const startsWithPattern = `${query.toLowerCase()}%`;

  const [treatments, hospitals, products] = await Promise.all([
    q<TreatmentResult>(
      `SELECT
        id,
        ko,
        en,
        COALESCE(group_id, '') as group_id,
        COALESCE(group_id, '') as category,
        summary,
        tags
      FROM ${TABLE_TREATMENTS_ROOT}
      WHERE
        en ILIKE $1 OR
        ko ILIKE $1 OR
        id ILIKE $1
      ORDER BY
        CASE WHEN LOWER(en) LIKE $2 THEN 1 ELSE 2 END,
        LENGTH(en) ASC
      LIMIT 20`,
      [searchPattern, startsWithPattern]
    ),

    q<HospitalResult>(
      `SELECT
        id_uuid,
        name,
        COALESCE(name_en, name) as name_en,
        COALESCE(address_gu_en, '') as address_gu_en,
        thumbnail_url,
        COALESCE(favorite_count, 0) as favorite_count
      FROM ${TABLE_HOSPITAL}
      WHERE
        show = true AND
        (name_en ILIKE $1 OR name ILIKE $1)
      ORDER BY
        favorite_count DESC NULLS LAST,
        LENGTH(COALESCE(name_en, name)) ASC
      LIMIT 20`,
      [searchPattern]
    ),

    q<ProductResult>(
      `SELECT
        tp.id,
        tp.id_uuid_hospital,
        tp.name,
        tp.level1,
        tp.department,
        COALESCE(tp.price, 0) as price,
        COALESCE(tp.group_id, '') as group_id,
        COALESCE(tp.matched_root_ids, ARRAY[]::text[]) as matched_root_ids,
        COALESCE(tp.match_score, 0) as match_score,
        COALESCE(h.name_en, h.name, '') as hospital_name,
        COALESCE(h.address_gu_en, '') as hospital_location
      FROM ${TABLE_TREATMENT_PRODUCT} tp
      LEFT JOIN ${TABLE_HOSPITAL} h ON h.id_uuid = tp.id_uuid_hospital
      WHERE
        tp.name->>'en' ILIKE $1 OR
        tp.name->>'ko' ILIKE $1 OR
        tp.group_id ILIKE $1
      ORDER BY
        tp.match_score DESC NULLS LAST,
        LENGTH(COALESCE(tp.name->>'en', '')) ASC
      LIMIT 20`,
      [searchPattern]
    ),
  ]);

  return { treatments, hospitals, products };
}

export default async function SearchResultsPage({ params, searchParams }: Props) {
  const query = searchParams.q?.trim() || "";
  const { treatments, hospitals, products } = await searchDatabase(query);
  const totalCount = treatments.length + hospitals.length + products.length;

  // Format price with currency conversion
  const formatPrice = (price: number) => {
    if (!price || price === 0) return null;

    const currencyInfo = getCurrencyInfo(params.locale);
    const convertedPrice = Math.round(price * currencyInfo.rate);
    const formattedPrice = convertedPrice.toLocaleString(currencyInfo.localeStr);

    return `${currencyInfo.symbol}${formattedPrice}`;
  };

  if (!query) {
    return (
      <div className="py-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Search</h1>
        <p className="text-gray-500">Enter a search term to find treatments, clinics, and products.</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for &quot;{query}&quot;
        </h1>
        <p className="text-gray-500">
          Found {totalCount} result{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {totalCount === 0 ? (
        <div className="py-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
          <p className="text-gray-500">Try different keywords or check your spelling.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Clinics Section */}
          {hospitals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Clinics
                <span className="text-sm font-normal text-gray-400">({hospitals.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {hospitals.map((hospital) => (
                  <Link
                    key={hospital.id_uuid}
                    href={`/hospital/${hospital.id_uuid}`}
                    className="group bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[4/3] bg-gray-100 relative">
                      {hospital.thumbnail_url ? (
                        <Image
                          src={hospital.thumbnail_url}
                          alt={hospital.name_en || hospital.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {hospital.name_en || hospital.name}
                      </h3>
                      {hospital.address_gu_en && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {hospital.address_gu_en}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Treatments Section */}
          {treatments.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Treatments
                <span className="text-sm font-normal text-gray-400">({treatments.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {treatments.map((treatment) => (
                  <Link
                    key={treatment.id}
                    href={`/hospital?treatmentId=${treatment.id}&treatmentNameKo=${encodeURIComponent(treatment.ko)}&treatmentNameEn=${encodeURIComponent(treatment.en)}`}
                    className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-pink-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {treatment.en}
                      </h3>
                      {treatment.ko && treatment.ko !== treatment.en && (
                        <p className="text-sm text-gray-500 truncate">
                          {treatment.ko}
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Products
                <span className="text-sm font-normal text-gray-400">({products.length})</span>
              </h2>
              <div className="space-y-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/hospital/${product.id_uuid_hospital}`}
                    className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.name?.en || product.name?.ko || "Product"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="truncate">{product.hospital_name}</span>
                        {product.hospital_location && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="truncate">{product.hospital_location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {formatPrice(product.price) && (
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-pink-600">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
