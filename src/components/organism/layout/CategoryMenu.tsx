"use client";
import { useState } from "react";
import CategoryDepth1 from "./CategoryDepth1";
import CategoryDepth2 from "./CategoryDepth2";
import CategoryDepth3 from "./CategoryDepth3";
import { SKIN_BEAUTY_CATEGORIES } from "@/app/(site)/contents/category/skinBeautyCategories";
import { PLASTIC_SURGERY_CATEGORIES } from "@/app/(site)/contents/category/plasticSurgeryCategories";
import { CATEGORY_ICONS } from "@/app/(site)/contents/menuIconData";
import { CategoryNode } from "@/app/(site)/contents/category/categoryNode";
import { useRouter } from "next/navigation";

const toIconList = (nodes: CategoryNode[], icons: any) =>
  nodes.map(node => ({
    key: node.key,
    label: node.label,
    icon: icons[node.key]?.src ?? "",
  }));

export default function CategoryMenu() {
  // 1: 'skin' | 'surgery', 2: 1뎁스 key, 3: 2뎁스 key
  const [tab, setTab] = useState<"skin" | "surgery" | "recommend">("recommend");
  const [selected1, setSelected1] = useState<string | null>(null); // 1뎁스 key
  const [selected2, setSelected2] = useState<string | null>(null); // 2뎁스 key
  const router = useRouter();

  // 현재 카테고리 데이터
  const rootNodes = tab === "skin" ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;
  const icons = tab === "skin" ? CATEGORY_ICONS.skin : CATEGORY_ICONS.surgery;

  // 1뎁스: 전체 목록
  const depth1List = toIconList(rootNodes, icons);

  // 2뎁스: 현재 선택된 1뎁스의 children
  const selected1Node = rootNodes.find(node => node.key === selected1);
  const depth2List = selected1Node?.children?.map(node => ({
    key: node.key,
    label: node.label,
    name: node.name,
  })) ?? [];

  // 3뎁스: 현재 선택된 2뎁스의 children
  const selected2Node = selected1Node?.children?.find(node => node.key === selected2);
  const depth3List = selected2Node?.children?.map(node => ({
    key: node.key,
    label: node.label,
    name: node.name,
  })) ?? [];

  // 추천 클릭시
  const handleRecommend = (tab: "skin" | "surgery" | "recommend") => {
    setTab(tab);
    setSelected1(null);
    setSelected2(null);
    log.debug("recommend clicked:", tab);
  };

  const handleSelect1 = (key: string) => {
    setSelected1(key);
    setSelected2(null);
  };

  const handleSelect2 = (key: string) => {
    // key == selected2
    // setSelected2(key);
    router.push(`/category/${tab}/${selected1}/${key}`);
    // setSelected2(key);
  };

  const handleSelect3 = (key: string) => {
    log.debug("3뎁스 선택:", key);
  };

  return (
    <div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        <CategoryDepth1
          title="Skin"
          categories={toIconList(SKIN_BEAUTY_CATEGORIES, CATEGORY_ICONS.skin)}
          selected={tab === "skin" ? (selected1 ?? "") : ""}
          onSelect={key => {
            setTab("skin");
            key === "recommend" ? handleRecommend("skin") : handleSelect1(key);
          }}
        />
        <CategoryDepth1
          title="Surgery"
          categories={toIconList(PLASTIC_SURGERY_CATEGORIES, CATEGORY_ICONS.surgery)}
          selected={tab === "surgery" ? (selected1 ?? "") : ""}
          onSelect={key => {
            setTab("surgery");
            key === "recommend" ? handleRecommend("surgery") : handleSelect1(key);
          }}
        />
      </div>

 
      {(tab === "skin" || tab === "surgery") && !!selected1 && !!depth2List.length && (
        <CategoryDepth2
          subCategories={depth2List}
          selected={selected2 ?? ""}
          onSelect={handleSelect2}
        />
      )}

{/*     
      {(tab === "skin" || tab === "surgery") && !!selected2 && !!depth3List.length && (
        <CategoryDepth3
          items={depth3List}
          selected={""}
          onSelect={handleSelect3}
        />
      )} */}
    </div>
  );
}
