'use client';

import { useState, useMemo, useEffect } from 'react';
// import deviceList from '@/constants/device_list.json';
import { Device } from '@/models/admin/devices.dto';
import { TabType } from '@/models/admin/common';

interface SupportDevicesProps {
  onDataChange: (selectedDevices: Set<string>) => void;
  initialDevices?: Set<string>;
}

const SupportDevices = ({
  onDataChange,
  initialDevices = new Set(),
}: SupportDevicesProps) => {
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(initialDevices);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('skin');
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  // API에서 장비 목록 가져오기
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/devices');
        if (!response.ok) throw new Error('Failed to fetch devices');
        const data = await response.json();
        setDeviceList(data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // 탭 전환 시 열린 depth 초기화
  const handleTabChange = (newTab: TabType) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setSelectedType(null);
      setSelectedGroup(null);
    }
  };

  // 탭에 따라 필터링된 장비 목록 (dept 기준)
  const filteredDevices = useMemo(() => {
    return deviceList.filter(device => {
      if (activeTab === 'skin') {
        return device.dept === 'skin' || device.dept === 'both';
      } else {
        return device.dept === 'plastic' || device.dept === 'both';
      }
    });
  }, [activeTab, deviceList]);

  // type별로 그룹화
  const devicesByType = useMemo(() => {
    const typeMap = new Map<string, Map<string, Device[]>>();

    filteredDevices.forEach(device => {
      if (!typeMap.has(device.type)) {
        typeMap.set(device.type, new Map());
      }
      const groupMap = typeMap.get(device.type)!;
      if (!groupMap.has(device.group)) {
        groupMap.set(device.group, []);
      }
      groupMap.get(device.group)!.push(device);
    });

    // type별로 정리
    return Array.from(typeMap.entries()).map(([type, groupMap]) => ({
      type,
      groups: Array.from(groupMap.entries()).map(([group, devices]) => ({
        group,
        devices: devices.sort((a, b) => a.ko.localeCompare(b.ko))
      }))
    }));
  }, [filteredDevices]);

  // 개별 장비 토글
  const toggleDevice = (deviceId: string) => {
    const newSelected = new Set(selectedDevices);

    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId);
    } else {
      newSelected.add(deviceId);
    }

    setSelectedDevices(newSelected);
    onDataChange(newSelected);
  };

  // 그룹 전체 토글
  const toggleGroup = (groupDevices: Device[]) => {
    const newSelected = new Set(selectedDevices);
    const allSelected = groupDevices.every(d => selectedDevices.has(d.id));

    if (allSelected) {
      groupDevices.forEach(d => newSelected.delete(d.id));
    } else {
      groupDevices.forEach(d => newSelected.add(d.id));
    }

    setSelectedDevices(newSelected);
    onDataChange(newSelected);
  };

  // 선택된 장비 목록 (그룹별로 정리)
  const getSelectedDevicesByGroup = () => {
    const result = new Map<string, Device[]>();

    (deviceList as Device[]).forEach(device => {
      if (selectedDevices.has(device.id)) {
        if (!result.has(device.group)) {
          result.set(device.group, []);
        }
        result.get(device.group)!.push(device);
      }
    });

    return Array.from(result.entries());
  };

  const getTypeLabel = (type: string): string => {
    if (language === 'ko') {
      return type === 'device' ? '장비' : type === 'drug' ? '약물' : '프로그램';
    } else {
      return type === 'device' ? 'Device' : type === 'drug' ? 'Drug' : 'Program';
    }
  };

  // selectedGroup을 type과 함께 저장하여 고유하게 만듦
  const getGroupKey = (typeKey: string, groupKey: string) => `${typeKey}/${groupKey}`;
  const isGroupOpen = (typeKey: string, groupKey: string) => {
    return selectedGroup === getGroupKey(typeKey, groupKey);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-gray-500">장비 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* 피부/성형 탭 + 언어 선택 */}
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
        {/* 선택된 장비 왼쪽 */}
        <div className="w-1/4 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
          <h2 className="font-bold mb-4 text-lg">
            {language === 'ko' ? '선택된 장비' : 'Selected Devices'}
          </h2>
          <div className="space-y-3">
            {getSelectedDevicesByGroup().map(([group, devices]) => (
              <div key={group} className="bg-white rounded border p-2">
                <div className="text-xs text-gray-500 mb-1">{group}</div>
                <div className="space-y-1">
                  {devices.map(device => (
                    <div
                      key={device.id}
                      className="text-sm flex justify-between items-center gap-2 py-1"
                    >
                      <span>{language === 'ko' ? device.ko : device.en}</span>
                      <button
                        onClick={() => toggleDevice(device.id)}
                        className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                        title={language === 'ko' ? '제거' : 'Remove'}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {getSelectedDevicesByGroup().length === 0 && (
              <div className="text-gray-400 text-sm">
                {language === 'ko' ? '선택된 장비가 없습니다' : 'No devices selected'}
              </div>
            )}
          </div>
        </div>

        {/* Type 목록 (1뎁스) */}
        <div className="w-1/4 border rounded-lg p-4 overflow-y-auto">
          <div className="space-y-1">
            {devicesByType.map(({ type, groups }) => {
              const isOpen = selectedType === type;
              const selectedCount = groups.reduce(
                (sum, g) => sum + g.devices.filter(d => selectedDevices.has(d.id)).length,
                0
              );

              return (
                <div key={type} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <button
                    onClick={() => setSelectedType(isOpen ? null : type)}
                    className={`flex-1 flex items-center justify-between px-3 py-1 text-sm rounded transition-colors ${
                      isOpen
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{getTypeLabel(type)}</span>
                      {selectedCount > 0 && (
                        <span className="text-xs">({selectedCount})</span>
                      )}
                    </div>
                    <span className="text-current">{isOpen ? '▼' : '▶'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 그룹 목록 (2뎁스) */}
        <div className="w-1/4 border rounded-lg p-4 overflow-y-auto bg-gray-50">
          {selectedType && (
            <div className="space-y-1">
              {devicesByType
                .find(t => t.type === selectedType)
                ?.groups.map(({ group, devices }) => {
                  const isOpen = isGroupOpen(selectedType, group);
                  const selectedCount = devices.filter(d => selectedDevices.has(d.id)).length;

                  return (
                    <div key={group} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                      <button
                        onClick={() => {
                          const newKey = isOpen ? null : getGroupKey(selectedType, group);
                          setSelectedGroup(newKey);
                        }}
                        className={`flex-1 flex items-center justify-between px-3 py-1 text-sm rounded transition-colors ${
                          isOpen
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{group}</span>
                          {selectedCount > 0 && (
                            <span className="text-xs">({selectedCount})</span>
                          )}
                        </div>
                        <span className="text-current">{isOpen ? '▼' : '▶'}</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* 장비 목록 (3뎁스) */}
        <div className="w-1/4 border rounded-lg p-4 overflow-y-auto bg-gray-50">
          {(() => {
            if (!selectedType || !selectedGroup) return null;

            // selectedGroup은 "type/group" 형태이므로 파싱
            const groupKey = selectedGroup.split('/')[1];

            return (
              <>
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-2">{groupKey}</div>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(() => {
                        const typeData = devicesByType.find(t => t.type === selectedType);
                        const groupData = typeData?.groups.find(g => g.group === groupKey);
                        return groupData?.devices.every(d => selectedDevices.has(d.id)) || false;
                      })()}
                      onChange={() => {
                        const typeData = devicesByType.find(t => t.type === selectedType);
                        const groupData = typeData?.groups.find(g => g.group === groupKey);
                        if (groupData) toggleGroup(groupData.devices);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="font-bold">
                      {language === 'ko' ? '전체 선택/해제' : 'Select/Deselect All'}
                    </span>
                  </label>
                </div>
                <div className="space-y-1">
                  {devicesByType
                    .find(t => t.type === selectedType)
                    ?.groups.find(g => g.group === groupKey)
                    ?.devices.map(device => (
                    <div
                      key={device.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedDevices.has(device.id)}
                          onChange={() => toggleDevice(device.id)}
                          className="w-4 h-4"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm">{language === 'ko' ? device.ko : device.en}</span>
                          {language === 'ko' && (
                            <span className="text-xs text-gray-500">{device.en}</span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default SupportDevices;
