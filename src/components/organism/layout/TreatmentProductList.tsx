"use client";

import { useMemo, useState } from "react";
import { TreatmentProductData, GroupedTreatmentProducts, TreatmentGroup } from "@/models/treatmentProduct.dto";
import TreatmentProductCard from "@/components/molecules/card/TreatmentProductCard";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface TreatmentProductListProps {
  products: TreatmentProductData[];
}

const TreatmentProductList = ({ products }: TreatmentProductListProps) => {
  const locale = useLocale();
  const t = useTranslations("TreatmentProduct");
  const tCommon = useTranslations("Common");
  const [isExpanded, setIsExpanded] = useState(false);

  // Group products by department and level1
  const groupedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Sort by department, group_id
    const sorted = [...products].sort((a, b) => {
      if (a.department !== b.department) {
        return a.department.localeCompare(b.department);
      }
      return a.group_id.localeCompare(b.group_id);
    });

    // Group by department
    const departmentMap = new Map<string, TreatmentProductData[]>();
    sorted.forEach(product => {
      if (!departmentMap.has(product.department)) {
        departmentMap.set(product.department, []);
      }
      departmentMap.get(product.department)!.push(product);
    });

    // Convert to GroupedTreatmentProducts structure
    const result: GroupedTreatmentProducts[] = [];
// log.debug("departmentMap",departmentMap);
    departmentMap.forEach((deptProducts, department) => {
      // Group by level1
      const level1Map = new Map<string, TreatmentProductData[]>();

      deptProducts.forEach(product => {
        const level1Key = JSON.stringify(product.level1); // Use JSON string as key to preserve both ko and en
        if (!level1Map.has(level1Key)) {
          level1Map.set(level1Key, []);
        }
        level1Map.get(level1Key)!.push(product);
      });

      // Convert level1 groups to TreatmentGroup[]
      const groups: TreatmentGroup[] = [];
      level1Map.forEach((items, level1Key) => {
        const groupTitle = items[0].level1; // Use level1 from first item
        groups.push({
          groupTitle,
          items
        });
      });

      result.push({
        department,
        groups
      });
    });

    return result;
  }, [products, locale]);

  // Calculate counts for each department and total
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    groupedProducts.forEach(deptGroup => {
      let deptCount = 0;
      deptGroup.groups.forEach(group => {
        deptCount += group.items.length;
      });
      counts[deptGroup.department] = deptCount;
      total += deptCount;
    });

    return { total, byDepartment: counts };
  }, [groupedProducts]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 border-b-8 border-gray-50">
      <div className="space-y-8">
        {/* Header with toggle button */}
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Treatment Products
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({productCounts.total})
            </span>
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex ml-8 items-center gap-1 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <span className="inline-block text-sm text-white bg-green-100 px-2.5 py-1 rounded-full font-medium">
              {/* {isExpanded ? "Close" : "View"} */}
              {isExpanded ? (locale === 'ko' ? "닫기" : "Close") : (locale === 'ko' ? "더보기" : "View More")}

            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
        <div className="mx-4 md:mx-auto md:max-w-[700px] p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 font-medium">
            ⚠️ {locale === 'ko' ? "표기된 가격은 참고용이며 실제 가격과 차이가 있을 수 있습니다. 정확한건 상담을 통해 확인해주세요." : "The prices shown are for reference only and may differ from the actual prices. Please confirm the exact prices through a consultation."}
          </p>
        </div>
        {/* Preview Mode (Collapsed) - Show only department and level1 titles */}
        {!isExpanded && (
          <div className="w-full md:max-w-[700px] md:mx-auto space-y-6">
            {groupedProducts.map((deptGroup, deptIndex) => (
              <div key={deptIndex} className="space-y-3">
                {/* Department Title */}
                <div className="border-b border-gray-300 pb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {deptGroup.department.toUpperCase()}
                    <span className="ml-2 text-base font-normal text-gray-500">
                      ({productCounts.byDepartment[deptGroup.department] || 0})
                    </span>
                  </h3>
                </div>

                {/* Level1 titles only - no products */}
                <div className="flex flex-wrap gap-2 pl-2">
                  {deptGroup.groups.map((group, groupIndex) => {
                    const level1Text = locale === 'ko' ? group.groupTitle.ko : group.groupTitle.en;
                    return (
                      <div
                        key={groupIndex}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{level1Text || '-'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expanded Mode - Show full details */}
        {isExpanded && (
          <div className="space-y-8">
            {groupedProducts.map((deptGroup, deptIndex) => (
              <div key={deptIndex} className="space-y-6">
                {/* Groups within department (grouped by level1) */}
                <div className="w-full md:max-w-[700px] md:mx-auto space-y-6">
                  {/* Department Title */}
                  <div className="border-b border-gray-300 pb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {deptGroup.department.toUpperCase()}
                      <span className="ml-2 text-base font-normal text-gray-500">
                        ({productCounts.byDepartment[deptGroup.department] || 0})
                      </span>
                    </h3>
                  </div>

                  {deptGroup.groups.map((group, groupIndex) => {
                    const level1Text = locale === 'ko' ? group.groupTitle.ko : group.groupTitle.en;

                    return (
                      <div key={groupIndex} className="space-y-2">
                        {/* Level1 Title */}
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <h4 className="text-base md:text-lg font-bold text-gray-800">
                            {level1Text || '-'}
                          </h4>
                        </div>

                        {/* Products in this level1 group (showing name) */}
                        <div className="space-y-1">
                          {group.items.map((product) => (
                            <TreatmentProductCard
                              key={product.id}
                              product={product}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 하단 닫기 버튼 - isExpanded일 때만 표시 */}
        {isExpanded && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsExpanded(false)}
              className="inline-block text-sm text-white bg-green-100 px-2.5 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
            >
              {locale === 'ko' ? "닫기" : "Close"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentProductList;
