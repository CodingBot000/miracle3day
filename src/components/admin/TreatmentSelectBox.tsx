"use client";

import React, { useState, useEffect } from "react";
// import { TreatmentSelectModal } from "../modal/TreatmentSelectModal";
import { TreatmentSelectModal } from "@/components/template/modal/TreatmentSelectModal";

// import { X } from "lucide-react";
// import { TREATMENT_CATEGORIES } from "@/app/contents/treatments";
import { CategoryNode } from "@/models/admin/category";
import { ProductOption } from "@/models/admin/common";
import { Button } from "@/components/ui/button";
import { log } from "@/utils/logger";

interface TreatmentData {
  selectedKeys: string[];
  productOptions: ProductOption[];
  priceExpose: boolean;
  etc: string;
  selectedDepartment: 'skin' | 'surgery';
}

interface TreatmentSelectBoxProps {
  onSelectionChange?: (data: TreatmentData) => void;
  initialSelectedKeys?: string[];
  initialProductOptions?: ProductOption[];
  initialPriceExpose?: boolean;
  initialEtc?: string;
  initialSelectedDepartment?: 'skin' | 'surgery';
  categories: CategoryNode[];
}

// const getLabelByKey = (() => {
//   // 한번만 트리 플랫하게 만들어서 성능 최적화
//   const map = new Map<number, string>();
//   const traverse = (nodes: CategoryNode[]) => {
//     nodes.forEach((n) => {
//       map.set(n.key, n.label);
//       if (n.children) traverse(n.children);
//     });
//   };
//   traverse(TREATMENT_CATEGORIES);
//   return (key: number) => map.get(key) ?? key.toString();
// })();

export function TreatmentSelectBox({ 
  onSelectionChange, 
  initialSelectedKeys = [], 
  initialProductOptions = [],
  initialPriceExpose = true,
  initialEtc = "",
  initialSelectedDepartment = 'skin',
  categories 
}: TreatmentSelectBoxProps) {
  log.info("TreatmentSelectBox 초기값:", {
    initialSelectedKeys,
    initialProductOptions,
    initialPriceExpose,
    initialEtc,
    categories
  });
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialSelectedKeys);
  const [productOptions, setProductOptions] = useState<ProductOption[]>(initialProductOptions);
  const [priceExpose, setPriceExpose] = useState<boolean>(initialPriceExpose);
  const [etc, setEtc] = useState<string>(initialEtc);
  const [selectedDepartment, setSelectedDepartment] = useState<'skin' | 'surgery'>(initialSelectedDepartment);
  const [modalOpen, setModalOpen] = useState(false);

  // 초기값이 변경될 때 상태 업데이트
  useEffect(() => {
    log.info('TreatmentSelectBox - 초기값 변경됨:', {
      initialSelectedKeys,
      initialProductOptions,
      initialPriceExpose,
      initialEtc,
      initialSelectedDepartment
    });
    
    if (initialSelectedKeys.length > 0 || initialProductOptions.length > 0 || initialEtc || initialPriceExpose !== true || initialSelectedDepartment !== 'skin') {
      log.info('TreatmentSelectBox - 초기값으로 상태 업데이트');
      setSelectedKeys(initialSelectedKeys);
      setProductOptions(initialProductOptions);
      setPriceExpose(initialPriceExpose);
      setEtc(initialEtc);
      setSelectedDepartment(initialSelectedDepartment);
    }
  }, [initialSelectedKeys, initialProductOptions, initialPriceExpose, initialEtc, initialSelectedDepartment]);

  // 선택된 항목이나 상품옵션이 변경될 때마다 상위 컴포넌트에 알림
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({ selectedKeys, productOptions, priceExpose, etc, selectedDepartment });
    }
  }, [selectedKeys, productOptions, priceExpose, etc, selectedDepartment, onSelectionChange]);

  const handleRemove = (key: string) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
    // 해당 시술의 상품옵션도 함께 제거
    setProductOptions((prev) => prev.filter((option) => option.treatmentKey !== key));
  };

  const handleOpen = () => {
    log.info(' TreatmentSelectBox - 모달 열기:', {
      selectedKeys: selectedKeys,
      selectedKeysLength: selectedKeys.length,
      productOptions: productOptions,
      productOptionsLength: productOptions.length
    });
    setModalOpen(true);
  };
  const handleClose = () => setModalOpen(false);

  const handleSave = (data: { selectedKeys: string[], productOptions: ProductOption[], etc: string, selectedDepartment: 'skin' | 'surgery' }) => {
    setSelectedKeys(data.selectedKeys);
    setProductOptions(data.productOptions);
    setEtc(data.etc);
    setSelectedDepartment(data.selectedDepartment);
    
    log.info(" TreatmentSelectBox - 저장된 데이터:", {
      selectedKeys: data.selectedKeys,
      productOptions: data.productOptions,
      etc: data.etc,
      selectedDepartment: data.selectedDepartment
    });
  };

  // 해당 시술에 연결된 상품옵션 개수 계산
  const getOptionCountForTreatment = (treatmentKey: string): number => {
    return productOptions.filter(option => option.treatmentKey === treatmentKey).length;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Button size="sm" type="button" onClick={handleOpen} className="bg-primary hover:bg-primary/90 focus-ring font-medium">
          가능시술 선택하기
        </Button>
        <p className="text-sm text-foreground">
          입력할 시술이 많다면 하단의 임시 저장 버튼을 자주 이용해주세요.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="price-expose-checkbox"
            checked={priceExpose}
            onChange={(e) => setPriceExpose(e.target.checked)}
            className="w-4 h-4 accent-primary cursor-pointer focus-ring rounded"
          />
          <label 
            htmlFor="price-expose-checkbox" 
            className="text-sm text-foreground cursor-pointer select-none font-medium"
          >
            고객에게 가격노출하기
          </label>
        </div>
      </div>
      {/* 선택 결과 칩 형태 */}
      {/* <TreatmentSelectedChips
        selectedKeys={selectedKeys}
        productOptions={productOptions}
        categories={categories}
        onRemove={handleRemove}
        showRemoveButton={true}
      /> */}
      
      {/* 선택된 시술 정보 표시 */}
      {/* <TreatmentSelectedOptionInfo
        selectedKeys={selectedKeys}
        productOptions={productOptions}
        etc={etc}
        categories={categories}
      />
       */}
      {/* 모달 */}
      <TreatmentSelectModal
        open={modalOpen}
        initialSelectedKeys={selectedKeys}
        initialProductOptions={productOptions}
        initialEtc={etc}
        initialSelectedDepartment={selectedDepartment}
        onClose={handleClose}
        onSave={handleSave}
        categories={categories}
      />
    </div>
  );
}
