"use client";

import React from "react";
import { X } from "lucide-react";
import { CategoryNode } from "@/models/admin/category";
import { ProductOption } from "@/models/admin/common";
import {
  getLabelByKey,
  getUnitByKey,
  getDepartmentByKey,
  getDepartmentDisplayName,
  getDepartmentStyleClass
} from "@/utils/categoryUtils";

interface TreatmentSelectedChipsProps {
  selectedKeys: string[];
  productOptions: ProductOption[];
  categories: CategoryNode[];
  onRemove?: (key: string) => void;
  showRemoveButton?: boolean;
  className?: string;
}

export function TreatmentSelectedChips({
  selectedKeys,
  productOptions,
  categories,
  onRemove,
  showRemoveButton = true,
  className = ""
}: TreatmentSelectedChipsProps) {
  // 해당 시술에 연결된 상품옵션 개수 계산
  const getOptionCountForTreatment = (treatmentKey: string): number => {
    return productOptions.filter(option => option.treatmentKey === treatmentKey).length;
  };

  // 부서별로 선택된 시술 그룹화 (group_id까지)
  const groupByDepartmentAndGroupId = () => {
    // department → group_id → 시술
    const result: Record<string, Record<string, string[]>> = {};
    selectedKeys.forEach(key => {
      const department = getDepartmentByKey(key, categories) || 'noDepartment';
      // group_id는 level1(카테고리 트리의 name)로 간주
      let groupId = '';
      categories.forEach(cat => {
        if (cat.children && cat.children.some(child => child.key.toString() === key)) {
          groupId = cat.name;
        }
      });
      if (!groupId) groupId = '기타';
      if (!result[department]) result[department] = {};
      if (!result[department][groupId]) result[department][groupId] = [];
      result[department][groupId].push(key);
    });
    return result;
  };

  // 칩 렌더링 함수
  const renderChips = (keys: string[]) => {
    return keys.map((key) => {
      const optionCount = getOptionCountForTreatment(key);
      return (
        <div
          key={key}
          className="flex items-center px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm shadow-sm hover:shadow-md transition-shadow"
        >
          {showRemoveButton && onRemove && (
            <button
              type="button"
              className="mr-2 hover:bg-destructive/10 p-0.5 rounded focus-ring"
              onClick={() => onRemove(key)}
              aria-label="선택 삭제"
            >
              <X className="w-3 h-3 text-destructive" />
            </button>
          )}
          <span className="mr-2 font-medium">{getLabelByKey(key, categories)}</span>
          {getUnitByKey(key, categories) && (
            <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-md font-medium mr-1">
              {getUnitByKey(key, categories)}
            </span>
          )}
          {getDepartmentByKey(key, categories) && (
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium mr-1 ${getDepartmentStyleClass(getDepartmentByKey(key, categories))}`}>
              {getDepartmentDisplayName(getDepartmentByKey(key, categories))}
            </span>
          )}
          {optionCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-bold">
              {optionCount}
            </span>
          )}
        </div>
      );
    });
  };

  // department → group_id → 시술 순서로 그룹핑
  const grouped = groupByDepartmentAndGroupId();
  const departmentOrder = ['skin', 'surgery', 'noDepartment'];
  const hasAnyTreatments = selectedKeys.length > 0;

  if (!hasAnyTreatments) {
    return (
      <div className={`flex flex-wrap gap-2 mb-4 ${className}`}>
        <div className="flex items-center gap-2 p-4 rounded-lg border border-dashed border-border bg-muted/20">
          <span className="text-muted-foreground">선택된 시술이 없습니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 mb-4 ${className}`}>
      {departmentOrder.map(dept => (
        grouped[dept] && (
          <div key={dept}>
            <div className="mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDepartmentStyleClass(dept === 'noDepartment' ? null : dept)}`}>
                {dept === 'skin' ? '피부' : dept === 'surgery' ? '성형' : '기타'}
              </span>
            </div>
            {/* group_id 알파벳순, 'other'는 마지막 */}
            {Object.keys(grouped[dept])
              .sort((a, b) => {
                if (a === 'other') return 1;
                if (b === 'other') return -1;
                return a.localeCompare(b);
              })
              .map(groupId => (
                <div key={groupId} className="mb-2 ml-2">
                  <span className="inline-block text-xs font-semibold text-gray-600 mb-1">{groupId}</span>
                  <div className="flex flex-wrap gap-2">
                    {renderChips(grouped[dept][groupId])}
                  </div>
                </div>
              ))}
          </div>
        )
      ))}
    </div>
  );
} 