"use client";

import React, { useEffect, useState } from "react";
// import { TREATMENT_CATEGORIES } from "@/app/contents/treatments";
import { CategoryNode } from "@/models/admin/category";
import { ProductOption } from "@/models/admin/common";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ProductOptionInput from "@/components/admin/ProductOptionInput";
import { useTreatmentCategories } from "@/hooks/useTreatmentCategories";

interface TreatmentSelectModalProps {
  open: boolean;
  initialSelectedKeys: string[];
  initialProductOptions?: ProductOption[];
  initialEtc?: string;
  initialSelectedDepartment?: 'skin' | 'surgery';
  onClose: () => void;
  onSave: (data: { selectedKeys: string[]; productOptions: ProductOption[]; etc: string; selectedDepartment: 'skin' | 'surgery' }) => void;
  categories: CategoryNode[];
}

// depth 정보를 가지면서 전체 카테고리 플랫하게 펼치기
const flattenCategoriesWithParentDepth = (categories: CategoryNode[], depth = 1, parentKeys: number[] = []) => {
  const result: {
    key: number;
    name: string;
    label: string;
    unit?: string;
    department?: string;
    depth: number;
    hasChildren: boolean;
    parentKeys: number[];
    isLastDepth: boolean;
  }[] = [];
  categories.forEach((node) => {
    const hasChildren = !!node.children?.length;
    const isLastDepth = !hasChildren;
    result.push({
      key: node.key,
      name: node.name,
      label: node.label,
      unit: node.unit,
      department: node.department,
      depth,
      hasChildren,
      parentKeys,
      isLastDepth,
    });
    if (hasChildren) {
      result.push(
        ...flattenCategoriesWithParentDepth(node.children!, depth + 1, [...parentKeys, node.key])
      );
    }
  });
  return result;
};

export function TreatmentSelectModal({
  open,
  initialSelectedKeys,
  initialProductOptions = [],
  initialEtc = "",
  initialSelectedDepartment = 'skin',
  onClose,
  onSave,
  categories,
}: TreatmentSelectModalProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialSelectedKeys);
  const [productOptions, setProductOptions] = useState<ProductOption[]>(initialProductOptions);
  const [etc, setEtc] = useState<string>(initialEtc);
  const [selectedDepartment, setSelectedDepartment] = useState<'skin' | 'surgery'>(initialSelectedDepartment);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 옵션없음 체크박스 상태 관리 (treatmentKey별로)
  const [noOptionChecked, setNoOptionChecked] = useState<Record<string, boolean>>({});
  // 이전값 저장용 (체크해제 시 복원용)
  const [previousValues, setPreviousValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      setSelectedKeys(initialSelectedKeys ?? []);
      setProductOptions(initialProductOptions ?? []);
      setEtc(initialEtc ?? "");
      setSelectedDepartment(initialSelectedDepartment ?? 'skin');
    }
  }, [open, initialSelectedKeys, initialProductOptions, initialEtc, initialSelectedDepartment]);

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      // 스크롤 막기
      document.body.style.overflow = 'hidden';
    } else {
      // 스크롤 복원
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // department별로 카테고리 필터링
  const filteredCategories = categories.map(category => ({
    ...category,
    children: category.children?.filter(child => 
      child.department === selectedDepartment || 
      child.children?.some(grandChild => grandChild.department === selectedDepartment)
    ).map(child => ({
      ...child,
      children: child.children?.filter(grandChild => grandChild.department === selectedDepartment)
    }))
  })).filter(category => category.children && category.children.length > 0);

  const flatList = flattenCategoriesWithParentDepth(filteredCategories);

  // 초기 선택된 시술들에 대해 unit 값에 따라 "옵션없음" 기본값 설정
  useEffect(() => {
    if (open && (initialSelectedKeys ?? []).length > 0) {
      const currentFlatList = flattenCategoriesWithParentDepth(categories);
      const initialNoOptionState: Record<string, boolean> = {};
      (initialSelectedKeys ?? []).forEach(key => {
        const treatmentItem = currentFlatList.find(item => item.key.toString() === key.toString());
        if (treatmentItem) {
          initialNoOptionState[key] = !treatmentItem.unit; // unit이 없으면 true, 있으면 false
        }
      });
      setNoOptionChecked(initialNoOptionState);
    }
  }, [open, initialSelectedKeys, categories]);

  // depth마다 마지막 depth가 체크박스 위치인지 파악
  const lastDepth = Math.max(...flatList.map((x) => x.depth));
  // 2뎁스 체크박스면 1뎁스만, 3뎁스 체크박스면 1,2뎁스 모두 강조

  // 체크박스가 있는 depth set 구하기
  const checkboxDepthSet = new Set(flatList.filter(x => x.isLastDepth).map(x => x.depth));

  const handleToggle = (key: string) => {
    setSelectedKeys((prev) => {
      const isCurrentlySelected = prev.includes(key);
      
      if (isCurrentlySelected) {
        // 체크 해제: 선택 목록에서만 제거 (옵션들은 유지)
        return prev.filter((k) => k !== key);
      } else {
        // 체크: 선택 목록에 추가
        const newSelectedKeys = [...prev, key];
        
        // 새로 선택된 시술에 대해 unit 값에 따라 "옵션없음" 기본값 설정
        const treatmentItem = flatList.find(item => item.key.toString() === key.toString());
        if (treatmentItem && !noOptionChecked.hasOwnProperty(key)) {
          setNoOptionChecked(prevState => ({
            ...prevState,
            [key]: !treatmentItem.unit // unit이 없으면 true, 있으면 false
          }));
        }
        
        return newSelectedKeys;
      }
    });
  };

  const handleSave = () => {
    // 1. 선택된 시술 중 ProductOptionInput이 없는 것들 체크
    const selectedTreatmentsWithoutOptions = selectedKeys.filter(key => {
      const options = getOptionsForTreatment(key);
      return options.length === 0;
    });
    
    if (selectedTreatmentsWithoutOptions.length > 0) {
      const treatmentNames = selectedTreatmentsWithoutOptions.map(key => {
        const treatmentItem = flatList.find(item => item.key.toString() === key.toString());
        return treatmentItem?.label || `시술 ${key}`;
      });
      
      alert(`다음 시술에 상품옵션이 없습니다:\n${treatmentNames.join(', ')}\n\n"상품옵션 추가" 버튼을 눌러서 최소 1개 이상의 옵션을 추가해주세요.`);
      return;
    }
    
    // 2. 선택된 시술의 옵션 중 가격이 0원인 항목 체크
    const selectedOptions = productOptions.filter(option => selectedKeys.includes(option.treatmentKey));
    const zeroPriceOptions = selectedOptions.filter(option => option.value2 === 0);
    
    if (zeroPriceOptions.length > 0) {
      // 가격이 0원인 시술 이름들 찾기
      const problematicTreatments = zeroPriceOptions.map(option => {
        const treatmentItem = flatList.find(item => item.key.toString() === option.treatmentKey.toString());
        return treatmentItem?.label || `시술 ${option.treatmentKey}`;
      });
      
      const uniqueTreatments = Array.from(new Set(problematicTreatments));
      const treatmentNames = uniqueTreatments.join(', ');
      
      alert(`다음 시술의 가격 정보가 적절하지 않습니다:\n${treatmentNames}\n\n가격을 0원보다 큰 값으로 설정해주세요.`);
      return;
    }
    
    // 선택된 시술의 옵션들만 제출
    onSave({ selectedKeys: [...selectedKeys], productOptions: selectedOptions, etc, selectedDepartment });
    handleClose();
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // 애니메이션 시간과 맞춤
  };

  // 배경 클릭 시 아무것도 하지 않음 (preventDefault)
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 아무것도 하지 않음 - 모달이 닫히지 않음
  };

  const handleAddOption = (treatmentKey: string) => {
    const newOption: ProductOption = {
      id: `${treatmentKey}-${Date.now()}`,
      treatmentKey,
      value1: 0,
      value2: 0,
    };
    setProductOptions(prev => [...prev, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    setProductOptions(prev => prev.filter(option => option.id !== optionId));
  };

  const handleOptionChange = (optionId: string, value1: number, value2: number) => {
    setProductOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { ...option, value1, value2 }
        : option
    ));
  };

  const getOptionsForTreatment = (treatmentKey: string) => {
    // 선택된 시술의 옵션들만 반환
    if (!selectedKeys.includes(treatmentKey)) {
      return [];
    }
    return productOptions.filter(option => option.treatmentKey === treatmentKey);
  };

  // 옵션없음 체크박스 토글 함수
  const handleNoOptionToggle = (treatmentKey: string) => {
    const isCurrentlyChecked = noOptionChecked[treatmentKey] || false;
    const newCheckedState = !isCurrentlyChecked;
    
    setNoOptionChecked(prev => ({
      ...prev,
      [treatmentKey]: newCheckedState
    }));
    
    // 해당 치료의 모든 옵션들 처리
    const treatmentOptions = getOptionsForTreatment(treatmentKey);
    
    if (newCheckedState) {
      // 체크됨: 모든 value1을 -1로 설정하기 전에 이전값 저장
      treatmentOptions.forEach(option => {
        if (option.value1 !== -1 && option.value1 !== 0) {
          setPreviousValues(prev => ({
            ...prev,
            [option.id]: option.value1
          }));
        }
      });
      
      // 모든 value1을 -1로 설정
      setProductOptions(prev => prev.map(option => 
        option.treatmentKey === treatmentKey 
          ? { ...option, value1: -1 }
          : option
      ));
    } else {
      // 체크해제됨: 이전값이 있으면 복원
      setProductOptions(prev => prev.map(option => {
        if (option.treatmentKey === treatmentKey) {
          const previousValue = previousValues[option.id];
          if (previousValue !== undefined && previousValue !== -1 && previousValue !== 0) {
            return { ...option, value1: previousValue };
          }
          return { ...option, value1: 0 };
        }
        return option;
      }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-maximum">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleBackdropClick}
      />
      
      {/* 하단 시트 */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 
          bg-card rounded-t-2xl shadow-2xl border-t border-l border-r border-border
          transition-transform duration-300 ease-out
          flex flex-col
          ${isAnimating ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ height: '95vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30 flex-shrink-0 rounded-t-2xl">
          <h2 className="text-xl font-semibold text-foreground">시술 선택</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors focus-ring"
          >
            <X size={20} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* 탭 영역 */}
        <div className="flex border-b border-border bg-muted/20">
          <button
            className={`px-6 py-3 text-sm font-medium transition-all focus-ring ${
              selectedDepartment === 'skin'
                ? 'text-primary bg-card border-b-2 border-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setSelectedDepartment('skin')}
          >
            피부
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium transition-all focus-ring ${
              selectedDepartment === 'surgery'
                ? 'text-primary bg-card border-b-2 border-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setSelectedDepartment('surgery')}
          >
            성형
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* 왼쪽 패널 - 시술 선택 */}
            <div className="w-100 overflow-y-auto p-6 border-r border-border bg-muted/10">
              <div className="space-y-2">
                {flatList.map((item, idx) => {
                  // 체크박스 있는 depth가 2 → 1뎁스만 강조, 3 → 1,2뎁스 모두 강조
                  let fontClass = "text-base";
                  let fontWeight = "font-normal";
                  // 2뎁스가 체크박스면 1뎁스만, 3뎁스면 1,2뎁스 모두 강조
                  if (
                    (checkboxDepthSet.has(2) && item.depth === 1) ||
                    (checkboxDepthSet.has(3) && (item.depth === 1 || item.depth === 2))
                  ) {
                    fontClass = "text-lg";
                    fontWeight = "font-bold";
                  }

                  return (
                    <div
                      key={`${item.key}-${idx}`}
                      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted/50 transition-all border border-transparent hover:border-border/50"
                      style={{ marginLeft: `${(item.depth - 1) * 24}px` }}
                    >
                      {item.hasChildren ? (
                        <span className={`${fontClass} ${fontWeight} text-foreground`}>
                          {item.label}
                        </span>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-primary cursor-pointer focus-ring rounded"
                            checked={selectedKeys.includes(item.key.toString())}
                            onChange={() => handleToggle(item.key.toString())}
                          />
                          <span 
                            className={`${fontClass} ${fontWeight} text-foreground cursor-pointer select-none flex-1`}
                            onClick={() => handleToggle(item.key.toString())}
                          >
                            {item.label}
                          </span>
                          {item.unit && (
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 ml-2 rounded-md font-medium">
                              {item.unit}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                
                {/* 기타 섹션 추가 */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-accent/20 border border-accent/30">
                    <span className="text-lg font-semibold text-accent-foreground">기타</span>
                  </div>
                  <div className="ml-6 mt-2">
                    <span className="text-sm text-muted-foreground">별도 기재가 필요한 시술이 있다면 우측 텍스트 영역에 입력해주세요.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 패널  : 상품옵션 */}
            <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
              <h3 className="text-lg font-semibold text-foreground mb-4 sticky top-0 bg-muted/20 pb-2">
                상품옵션 관리
              </h3>
              
              {selectedKeys.length === 0 ? (
                <div className="text-center text-muted-foreground mt-12 p-8 bg-card rounded-lg border border-dashed border-border">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-base font-medium mb-2">시술을 선택해주세요</p>
                  <p className="text-sm">왼쪽에서 시술을 선택하고 상품옵션을 추가해보세요</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedKeys.map((treatmentKey) => {
                    const options = getOptionsForTreatment(treatmentKey);
                    const treatmentItem = flatList.find(item => item.key.toString() === treatmentKey.toString());
                    
                    if (!treatmentItem) return null;
                    
                    return (
                      <div key={`options-${treatmentKey}`} className="bg-card p-5 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-primary">
                            {treatmentItem.label}
                            {treatmentItem.unit && (
                              <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md font-medium">
                                {treatmentItem.unit}
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-3">
                            {treatmentItem.department !== 'surgery' && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 accent-destructive cursor-pointer focus-ring rounded"
                                  checked={noOptionChecked[treatmentKey] || false}
                                  onChange={() => handleNoOptionToggle(treatmentKey)}
                                />
                                <span className="text-xs text-destructive font-medium">옵션없음</span>
                              </label>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAddOption(treatmentKey)}
                              className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors focus-ring font-medium"
                            >
                              상품옵션 추가
                            </button>
                          </div>
                        </div>
                        
                        {options.length === 0 ? (
                          <div className="text-center p-4 bg-muted/30 rounded-lg border border-dashed border-border">
                            <p className="text-xs text-muted-foreground">
                              아직 상품옵션이 없습니다
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {options.map((option) => (
                              <ProductOptionInput
                                key={option.id}
                                id={option.id}
                                initialValue1={option.value1}
                                initialValue2={option.value2}
                                onRemove={handleRemoveOption}
                                onChange={handleOptionChange}
                                isHidden={noOptionChecked[treatmentKey] || false}
                                unit={treatmentItem.unit}
                                department={treatmentItem.department}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* 기타 입력 섹션 */}
              <div className="mt-6 bg-card p-5 rounded-lg border border-border shadow-sm">
                <h4 className="text-sm font-semibold text-foreground mb-3">기타 시술 정보</h4>
                <textarea
                  value={etc}
                  onChange={(e) => setEtc(e.target.value)}
                  placeholder="카테고리에 없는 시술이나 추가 정보가 있다면 여기에 입력해주세요..."
                  className="w-full h-24 p-3 border border-input rounded-md resize-none focus-ring text-sm bg-input"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  이 정보는 별도로 저장되어 관리됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="border-t border-border p-6 bg-card flex-shrink-0">
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              ⚠️ <strong>주의:</strong> 옵션입력 후 상품을 임시로 체크박스를 해제한 경우 완료를 누르면 입력한 상품이 사라집니다. 완료는 입력/수정이 모두 완료된 후 눌러주세요.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="px-6 py-2.5 text-sm focus-ring"
            >
              취소
            </Button>
            <Button 
              onClick={handleSave}
              className="px-6 py-2.5 text-sm bg-primary hover:bg-primary/90 focus-ring font-medium"
            >
              완료 ({selectedKeys.length}개 선택)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}