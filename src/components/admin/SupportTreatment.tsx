'use client';

import { useState, useMemo } from 'react';
import { SKIN_BEAUTY_CATEGORIES } from '@/content/admin/skinBeautyCategories';
import { PLASTIC_SURGERY_CATEGORIES } from '@/content/admin/plasticSurgeryCategories';
import { CategoryNodeTag } from '@/models/admin/category';
import { TabType } from '@/models/admin/common';

interface SupportTreatmentProps {
  onDataChange: (skinItems: Set<string>, plasticItems: Set<string>) => void;
  initialSkinItems?: Set<string>;
  initialPlasticItems?: Set<string>;
}


const SupportTreatment = ({
  onDataChange,
  initialSkinItems = new Set(),
  initialPlasticItems = new Set(),
}: SupportTreatmentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('skin');
  const [selectedSkinItems, setSelectedSkinItems] = useState<Set<string>>(initialSkinItems);
  const [selectedPlasticItems, setSelectedPlasticItems] = useState<Set<string>>(initialPlasticItems);

  const [skinOpenDepth1, setSkinOpenDepth1] = useState<string | null>(null);
  const [skinOpenDepth2, setSkinOpenDepth2] = useState<string | null>(null);

  const [plasticOpenDepth1, setPlasticOpenDepth1] = useState<string | null>(null);
  const [plasticOpenDepth2, setPlasticOpenDepth2] = useState<string | null>(null);

  const [expandedSelectedDepth1, setExpandedSelectedDepth1] = useState<Set<string>>(new Set());

  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  // 탭 전환 시 열린 depth 초기화
  const handleTabChange = (newTab: TabType) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      if (newTab === 'skin') {
        setSkinOpenDepth1(null);
        setSkinOpenDepth2(null);
      } else {
        setPlasticOpenDepth1(null);
        setPlasticOpenDepth2(null);
      }
    }
  };

  const createItemUid = (type: TabType, path: string[]): string => {
    return `${type}/${path.join('/')}`;
  };

  // Get node's ID from path
  const getNodeFromPath = (type: TabType, path: string[]): CategoryNodeTag | undefined => {
    const categoriesData = type === 'skin' ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;
    let currentNode: CategoryNodeTag | undefined;

    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === 0) {
        currentNode = categoriesData.find(cat => cat.key === key);
      } else {
        currentNode = currentNode?.children?.find(child => child.key === key);
      }
      if (!currentNode) return undefined;
    }
    return currentNode;
  };

  const getAllChildIds = (node: CategoryNodeTag): string[] => {
    const ids = [node.id];
    if (node.children) {
      node.children.forEach(child => {
        ids.push(...getAllChildIds(child));
      });
    }
    return ids;
  };

  const getAllChildUids = (type: TabType, node: CategoryNodeTag, parentPath: string[] = []): string[] => {
    const currentPath = [...parentPath, node.key];
    const currentUid = createItemUid(type, currentPath);
    const uids = [currentUid];

    if (node.children) {
      node.children.forEach(child => {
        uids.push(...getAllChildUids(type, child, currentPath));
      });
    }

    return uids;
  };

  const toggleItem = (type: TabType, path: string[]) => {
    const uid = createItemUid(type, path);
    const node = getNodeFromPath(type, path);
    if (!node) return;

    const currentSelected = type === 'skin' ? selectedSkinItems : selectedPlasticItems;
    const newSelected = new Set(currentSelected);

    // Store ID instead of UID
    if (newSelected.has(uid)) {
      newSelected.delete(uid);
    } else {
      newSelected.add(uid);
    }

    if (type === 'skin') {
      setSelectedSkinItems(newSelected);
      onDataChange(newSelected, selectedPlasticItems);
    } else {
      setSelectedPlasticItems(newSelected);
      onDataChange(selectedSkinItems, newSelected);
    }
  };

  const toggleAll = (type: TabType, node: CategoryNodeTag, parentPath: string[] = []) => {
    const allUids = getAllChildUids(type, node, parentPath);
    const currentSelected = type === 'skin' ? selectedSkinItems : selectedPlasticItems;
    const newSelected = new Set(currentSelected);

    const allChecked = allUids.every(uid => currentSelected.has(uid));

    if (allChecked) {
      allUids.forEach(uid => newSelected.delete(uid));
    } else {
      allUids.forEach(uid => newSelected.add(uid));
    }

    if (type === 'skin') {
      setSelectedSkinItems(newSelected);
      onDataChange(newSelected, selectedPlasticItems);
    } else {
      setSelectedPlasticItems(newSelected);
      onDataChange(selectedSkinItems, newSelected);
    }
  };

  const isAllSelected = (type: TabType, node: CategoryNodeTag, parentPath: string[] = []): boolean => {
    const allUids = getAllChildUids(type, node, parentPath);
    const currentSelected = type === 'skin' ? selectedSkinItems : selectedPlasticItems;
    return allUids.every(uid => currentSelected.has(uid));
  };

  const parseUid = (uid: string): { type: TabType; path: string[] } => {
    const [type, ...pathParts] = uid.split('/');
    return { type: type as TabType, path: pathParts };
  };

  const getSelectedItemsGrouped = () => {
    // Combine both skin and plastic items
    const allSelected = new Set([...Array.from(selectedSkinItems), ...Array.from(selectedPlasticItems)]);

    const skinGrouped = new Map<string, Array<{ uid: string; path: string[]; type: TabType }>>();
    const plasticGrouped = new Map<string, Array<{ uid: string; path: string[]; type: TabType }>>();

    allSelected.forEach(uid => {
      const { type, path } = parseUid(uid);

      const depth1Key = path[0];
      const targetMap = type === 'skin' ? skinGrouped : plasticGrouped;

      if (!targetMap.has(depth1Key)) {
        targetMap.set(depth1Key, []);
      }
      targetMap.get(depth1Key)!.push({ uid, path, type });
    });

    const skinResults = Array.from(skinGrouped.entries()).map(([depth1Key, items]) => {
      const depth1Node = SKIN_BEAUTY_CATEGORIES.find(cat => cat.key === depth1Key);
      return {
        depth1Key,
        depth1Label: depth1Node ? (language === 'ko' ? depth1Node.ko : depth1Node.en) : depth1Key,
        type: 'skin' as TabType,
        items: items.sort((a, b) => a.path.join('/').localeCompare(b.path.join('/'))),
      };
    });

    const plasticResults = Array.from(plasticGrouped.entries()).map(([depth1Key, items]) => {
      const depth1Node = PLASTIC_SURGERY_CATEGORIES.find(cat => cat.key === depth1Key);
      return {
        depth1Key,
        depth1Label: depth1Node ? (language === 'ko' ? depth1Node.ko : depth1Node.en) : depth1Key,
        type: 'plastic' as TabType,
        items: items.sort((a, b) => a.path.join('/').localeCompare(b.path.join('/'))),
      };
    });

    // Sort: skin first, then plastic
    return [...skinResults, ...plasticResults];
  };

  const toggleExpandedDepth1 = (type: TabType, depth1Key: string) => {
    const uid = `${type}/${depth1Key}`;
    const newExpanded = new Set(expandedSelectedDepth1);

    if (newExpanded.has(uid)) {
      newExpanded.delete(uid);
    } else {
      newExpanded.add(uid);
    }

    setExpandedSelectedDepth1(newExpanded);
  };

  const getNameFromPath = (path: string[], type: TabType): string => {
    const categoriesData = type === 'skin' ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;

    let currentNode: CategoryNodeTag | undefined;
    const names: string[] = [];

    for (let i = 0; i < path.length; i++) {
      const key = path[i];

      if (i === 0) {
        currentNode = categoriesData.find(cat => cat.key === key);
      } else {
        currentNode = currentNode?.children?.find(child => child.key === key);
      }

      if (currentNode) {
        names.push(language === 'ko' ? currentNode.ko : currentNode.en);
      }
    }

    return names.join(' > ');
  };

  const getDisplayText = (node: CategoryNodeTag): string => {
    return language === 'ko' ? node.ko : node.en;
  };

  const categoriesData = activeTab === 'skin' ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;
  const selectedItems = activeTab === 'skin' ? selectedSkinItems : selectedPlasticItems;

  const openDepth1 = activeTab === 'skin' ? skinOpenDepth1 : plasticOpenDepth1;
  const setOpenDepth1 = activeTab === 'skin' ? setSkinOpenDepth1 : setPlasticOpenDepth1;
  const openDepth2 = activeTab === 'skin' ? skinOpenDepth2 : plasticOpenDepth2;
  const setOpenDepth2 = activeTab === 'skin' ? setSkinOpenDepth2 : setPlasticOpenDepth2;

  // depth2를 열고 닫을 때 depth1 경로를 포함한 고유 키 사용
  const getDepth2Key = (depth1Key: string, depth2Key: string) => `${depth1Key}/${depth2Key}`;
  const isDepth2Open = (depth1Key: string, depth2Key: string) => {
    return openDepth2 === getDepth2Key(depth1Key, depth2Key);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* 피부/성형 탭 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange('skin')}
            className={`px-4 py-2 rounded ${
              activeTab === 'skin'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'ko' ? '피부' : 'Skin Beauty'}
          </button>
          <button
            onClick={() => handleTabChange('plastic')}
            className={`px-4 py-2 rounded ${
              activeTab === 'plastic'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'ko' ? '성형' : 'Plastic Surgery'}
          </button>
        </div>
        <div className="flex gap-1 border rounded overflow-hidden">
          <button
            onClick={() => setLanguage('ko')}
            className={`px-3 py-1 text-sm ${
              language === 'ko'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            한글
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-sm ${
              language === 'en'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* 4칸 레이아웃 */}
      <div className="flex gap-4 flex-1">
        {/* 선택된 시술 */}
        <div className="w-1/4 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
          <h2 className="font-bold mb-4 text-lg">
            {language === 'ko' ? '선택된 시술' : 'Selected Treatments'}
          </h2>
          <div className="space-y-2">
            {(() => {
              const groupedItems = getSelectedItemsGrouped();
              const skinGroups = groupedItems.filter(g => g.type === 'skin');
              const plasticGroups = groupedItems.filter(g => g.type === 'plastic');

              if (groupedItems.length === 0) {
                return (
                  <div className="text-gray-400 text-sm">
                    {language === 'ko' ? '선택된 시술이 없습니다' : 'No treatments selected'}
                  </div>
                );
              }

              return (
                <>
                  {skinGroups.length > 0 && (
                    <>
                      <div className="text-sm font-semibold text-blue-600 mb-1">
                        {language === 'ko' ? '피부' : 'Skin'}
                      </div>
                      {skinGroups.map(group => {
                        const expandUid = `${group.type}/${group.depth1Key}`;
                        const isExpanded = expandedSelectedDepth1.has(expandUid);

                        return (
                          <div key={expandUid} className="bg-white rounded border">
                            <div className="flex items-center justify-between p-2">
                              <button
                                onClick={() => toggleExpandedDepth1(group.type, group.depth1Key)}
                                className="flex-1 flex items-center gap-2 text-left"
                              >
                                <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                                <span className="text-sm font-medium">{group.depth1Label}</span>
                                <span className="text-xs text-gray-500">({group.items.length})</span>
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="px-2 pb-2 space-y-1 border-t pt-1">
                                {group.items.map(({ uid, path, type }) => (
                                  <div
                                    key={uid}
                                    className="text-xs flex justify-between items-center gap-2 py-1 pl-4"
                                  >
                                    <span className="text-gray-700">{getNameFromPath(path, type)}</span>
                                    <button
                                      onClick={() => toggleItem(type, path)}
                                      className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                      title="제거"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                  {plasticGroups.length > 0 && (
                    <>
                      <div className="text-sm font-semibold text-purple-600 mb-1 mt-3">
                        {language === 'ko' ? '성형' : 'Plastic Surgery'}
                      </div>
                      {plasticGroups.map(group => {
                        const expandUid = `${group.type}/${group.depth1Key}`;
                        const isExpanded = expandedSelectedDepth1.has(expandUid);

                        return (
                          <div key={expandUid} className="bg-white rounded border">
                            <div className="flex items-center justify-between p-2">
                              <button
                                onClick={() => toggleExpandedDepth1(group.type, group.depth1Key)}
                                className="flex-1 flex items-center gap-2 text-left"
                              >
                                <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                                <span className="text-sm font-medium">{group.depth1Label}</span>
                                <span className="text-xs text-gray-500">({group.items.length})</span>
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="px-2 pb-2 space-y-1 border-t pt-1">
                                {group.items.map(({ uid, path, type }) => (
                                  <div
                                    key={uid}
                                    className="text-xs flex justify-between items-center gap-2 py-1 pl-4"
                                  >
                                    <span className="text-gray-700">{getNameFromPath(path, type)}</span>
                                    <button
                                      onClick={() => toggleItem(type, path)}
                                      className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                      title="제거"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Depth 1 */}
        <div className="w-1/4 border rounded-lg p-4 overflow-y-auto">
          <div className="space-y-1">
            {categoriesData.map(depth1 => {
              const isOpen = openDepth1 === depth1.key;
              const hasChildren = depth1.children && depth1.children.length > 0;

              if (!hasChildren) {
                const path = [depth1.key];
                const uid = createItemUid(activeTab, path);
                return (
                  <div key={depth1.key} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(uid)}
                        onChange={() => toggleItem(activeTab, path)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{getDisplayText(depth1)}</span>
                    </label>
                  </div>
                );
              }

              return (
                <div key={depth1.key} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <button
                    onClick={() => setOpenDepth1(isOpen ? null : depth1.key)}
                    className={`flex-1 flex items-center justify-between px-3 py-1 text-sm rounded transition-colors ${
                      isOpen
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{getDisplayText(depth1)}</span>
                    <span className="text-current">{isOpen ? '▼' : '▶'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Depth 2 */}
        <div className="w-1/4 border rounded-lg p-4 overflow-y-auto bg-gray-50">
          {openDepth1 && (
            <div className="space-y-1">
              {categoriesData
                .find(d1 => d1.key === openDepth1)
                ?.children?.map(depth2 => {
                  const isOpen = isDepth2Open(openDepth1, depth2.key);
                  const hasChildren = depth2.children && depth2.children.length > 0;

                  if (!hasChildren) {
                    const path = [openDepth1, depth2.key];
                    const uid = createItemUid(activeTab, path);
                    return (
                      <div key={depth2.key} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(uid)}
                            onChange={() => toggleItem(activeTab, path)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{getDisplayText(depth2)}</span>
                        </label>
                      </div>
                    );
                  }

                  return (
                    <div key={depth2.key} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                      <button
                        onClick={() => {
                          const newKey = isOpen ? null : getDepth2Key(openDepth1, depth2.key);
                          setOpenDepth2(newKey);
                        }}
                        className={`flex-1 flex items-center justify-between px-3 py-1 text-sm rounded transition-colors ${
                          isOpen
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{getDisplayText(depth2)}</span>
                        <span className="text-current">{isOpen ? '▼' : '▶'}</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Depth 3 */}
        <div className="w-1/4 border rounded-lg p-4 overflow-y-auto bg-gray-50">
          {(() => {
            if (!openDepth1 || !openDepth2) return null;

            // openDepth2는 "depth1/depth2" 형태이므로 파싱
            const depth2Key = openDepth2.split('/')[1];

            return (
              <>
                <label className="flex items-center gap-2 mb-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(() => {
                      const depth1Node = categoriesData.find(d1 => d1.key === openDepth1);
                      const depth2Node = depth1Node?.children?.find(d2 => d2.key === depth2Key);
                      return depth2Node ? isAllSelected(activeTab, depth2Node, [openDepth1]) : false;
                    })()}
                    onChange={() => {
                      const depth1Node = categoriesData.find(d1 => d1.key === openDepth1);
                      const depth2Node = depth1Node?.children?.find(d2 => d2.key === depth2Key);
                      if (depth2Node) {
                        toggleAll(activeTab, depth2Node, [openDepth1]);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="font-bold">
                    {language === 'ko' ? '전체 선택/해제' : 'Select/Deselect All'}
                  </span>
                </label>
                <div className="space-y-1">
                  {categoriesData
                    .find(d1 => d1.key === openDepth1)
                    ?.children?.find(d2 => d2.key === depth2Key)
                    ?.children?.map(depth3 => {
                      const path = [openDepth1, depth2Key, depth3.key];
                      const uid = createItemUid(activeTab, path);
                    return (
                      <div
                        key={depth3.key}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(uid)}
                            onChange={() => toggleItem(activeTab, path)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{getDisplayText(depth3)}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default SupportTreatment;
