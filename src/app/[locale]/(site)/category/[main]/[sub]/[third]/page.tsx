"use client";

import { log } from '@/utils/logger';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SKIN_BEAUTY_CATEGORIES } from "@/app/[locale]/(site)/contents/category/skinBeautyCategories";
import { PLASTIC_SURGERY_CATEGORIES } from "@/app/[locale]/(site)/contents/category/plasticSurgeryCategories";
import { CATEGORY_ICONS } from "@/app/[locale]/(site)/contents/menuIconData";
import CategoryDepth1 from "@/components/organism/layout/CategoryDepth1";
import CategoryDepth2 from "@/components/organism/layout/CategoryDepth2";
import CategoryDepth3 from "@/components/organism/layout/CategoryDepth3";
import { CategoryNode } from "@/app/[locale]/(site)/contents/category/categoryNode";
import CategoryEventProductList from "@/app/[locale]/(site)/category/component/CategoryEventProductList";

// 아이콘 목록 유틸
const toIconList = (nodes: CategoryNode[], icons: any) =>
  nodes.map((node) => ({
    key: node.key,
    label: node.label,
    name: node.name,
    icon: icons[node.key]?.src ?? "",
  }));

export default function CategoryDetailPage() {
  const params = useParams<{ main: string; sub: string; third: string }>();

  // main 파라미터를 state로 관리 (skin/surgery)
  const [main, setMain] = useState<"skin" | "surgery">(
    (params.main as "skin" | "surgery") || "skin"
  );

  // 아래 두개는 key만 들고 있음
  const [selected1, setSelected1] = useState<string | null>(params.sub || null);
  const [selected2, setSelected2] = useState<string | null>(
    params.third || null
  );
  const [selected3, setSelected3] = useState<string | null>(
    params.third || null
  );

  // 데이터 트리
  const rootNodes =
    main === "skin" ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;
  const icons = main === "skin" ? CATEGORY_ICONS.skin : CATEGORY_ICONS.surgery;

  // 1뎁스
  const depth1List = toIconList(rootNodes, icons);

  // 2뎁스: 현재 선택된 1뎁스의 children
  const selected1Node = rootNodes.find((node) => node.key === selected1);
  const depth2List =
    selected1Node?.children?.map((node) => ({
      key: node.key,
      label: node.label,
      name: node.name,
    })) ?? [];

  // 3뎁스: 현재 선택된 2뎁스의 children
  const selected2Node = selected1Node?.children?.find(
    (node) => node.key === selected2
  );
  const depth3List =
    selected2Node?.children?.map((node) => ({
      key: node.key,
      label: node.label,
      name: node.name,
    })) ?? [];

  // 1뎁스 변경 시: 2뎁스/3뎁스 자동 초기화
  const handleSelect1 = (key: string) => {
    setSelected1(key);
    // 2뎁스 첫번째 자동선택
    const first2 =
      rootNodes.find((node) => node.key === key)?.children?.[0]?.key ?? null;
    setSelected2(first2);
  };

  // 2뎁스 변경 시: 3뎁스 자동 초기화
  const handleSelect2 = (key: string) => {
    setSelected2(key);
  };

  const handleSelect3 = (key: string, index: number) => {
    log.debug("handleSelect3", key, index);
    setSelected3(index.toString()); //테스트위한임시
  };

  // Skin/Surgery 탭 변경 시, 뎁스 모두 첫번째로 동기화
  const handleTabChange = (type: "skin" | "surgery") => {
    setMain(type);
    const nodes =
      type === "skin" ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;
    const first1 = nodes[0]?.key ?? null;
    setSelected1(first1);
    const first2 = nodes[0]?.children?.[0]?.key ?? null;
    setSelected2(first2);
  };

  // 첫 mount 또는 main/sub/third URL 파라미터 변경될 때 초기화
  useEffect(() => {
    if (!selected1) {
      const first1 = rootNodes[0]?.key ?? null;
      setSelected1(first1);
      const first2 = rootNodes[0]?.children?.[0]?.key ?? null;
      setSelected2(first2);
    } else if (!selected2 && selected1) {
      const first2 =
        rootNodes.find((node) => node.key === selected1)?.children?.[0]?.key ??
        null;
      setSelected2(first2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main]);

  // Skin/Surgery 탭 UI
  return (
    <div>
      <div className="flex gap-2 mb-4 justify-center">
        {["skin", "surgery"].map((type) => (
          <button
            key={type}
            onClick={() => handleTabChange(type as "skin" | "surgery")}
            className={`
              text-base px-6 py-1 rounded-full
              font-bold
              ${
                main === type
                  ? "text-orange-500 border-b-4 border-orange-400 bg-orange-50"
                  : "text-gray-400"
              }
              transition
            `}
          >
            {type === "skin" ? "Skin" : "Surgery"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1  gap-2 w-full">
        <CategoryDepth1
          title={main === "skin" ? "피부" : "성형"}
          categories={depth1List}
          selected={selected1 ?? ""}
          onSelect={handleSelect1}
        />
      </div>
      <CategoryDepth2
        subCategories={depth2List}
        selected={selected2 ?? ""}
        onSelect={handleSelect2}
      />
      {/* 3뎁스: 2뎁스 선택시만 */}
      {!!depth3List.length && (
        <CategoryDepth3
          items={depth3List}
          selected={selected3 ?? ""}
          onSelect={handleSelect3}
        />
      )}

      {/* {selected3 && (
        <CategoryEventProductList
          params={{
            main,
            depth1: selected1 ?? "",
            depth2: selected2 ?? "",
            depth3: selected3 ?? "",
            index: selected3 ?? "0",
          }}
          searchParams={{}}
        />
      )} */}
      {selected3 && (
      <CategoryEventProductList
          main={main}
          depth1={selected1 ?? ""}
          depth2={selected2 ?? ""}
          depth3={selected3 ?? ""}
          index={selected3  ?? "0"}
        />
      )}
    </div>
  );
}
