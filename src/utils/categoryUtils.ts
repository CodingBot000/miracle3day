import { CategoryNode } from "@/models/admin/category";

/**
 * 카테고리 트리에서 특정 키에 해당하는 라벨을 찾는 함수
 * @param key 찾을 키 값
 * @param categories 카테고리 노드 배열
 * @returns 라벨 문자열 또는 키 값의 문자열
 */
export const getLabelByKey = (key: string | number, categories: CategoryNode[]): string => {
  const findLabel = (nodes: CategoryNode[]): string | null => {
    for (const node of nodes) {
      if (node.key.toString() === key.toString()) return node.label;
      if (node.children) {
        const found = findLabel(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  return findLabel(categories) || key.toString();
};

/**
 * 카테고리 트리에서 특정 키에 해당하는 단위(unit)를 찾는 함수
 * @param key 찾을 키 값
 * @param categories 카테고리 노드 배열
 * @returns 단위 문자열 또는 null
 */
export const getUnitByKey = (key: string | number, categories: CategoryNode[]): string | null => {
  const findUnit = (nodes: CategoryNode[]): string | null => {
    for (const node of nodes) {
      if (node.key.toString() === key.toString()) return node.unit || null;
      if (node.children) {
        const found = findUnit(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  return findUnit(categories);
};

/**
 * 카테고리 트리에서 특정 키에 해당하는 분야(department)를 찾는 함수
 * @param key 찾을 키 값
 * @param categories 카테고리 노드 배열
 * @returns 분야 문자열 또는 null
 */
export const getDepartmentByKey = (key: string | number, categories: CategoryNode[]): string | null => {
  const findDepartment = (nodes: CategoryNode[]): string | null => {
    for (const node of nodes) {
      if (node.key.toString() === key.toString()) return node.department || null;
      if (node.children) {
        const found = findDepartment(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  return findDepartment(categories);
};

/**
 * 카테고리 트리를 평면화하여 모든 노드를 배열로 반환하는 함수
 * @param categories 카테고리 노드 배열
 * @returns 평면화된 카테고리 노드 배열
 */
export const flattenCategories = (categories: CategoryNode[]): CategoryNode[] => {
  const result: CategoryNode[] = [];
  
  const traverse = (nodes: CategoryNode[]) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  
  traverse(categories);
  return result;
};

/**
 * 카테고리 트리에서 키를 키로 하는 라벨 매핑 맵을 생성하는 함수
 * @param categories 카테고리 노드 배열
 * @returns Map<number, string> 형태의 매핑 맵
 */
export const createCategoryLabelMap = (categories: CategoryNode[]): Map<number, string> => {
  const map = new Map<number, string>();
  
  const traverse = (nodes: CategoryNode[]) => {
    nodes.forEach((node) => {
      if (node.key !== -1) { // -1은 루트 노드이므로 제외
        map.set(node.key, node.label);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  
  traverse(categories);
  return map;
};

/**
 * 카테고리 트리에서 키를 키로 하는 분야 매핑 맵을 생성하는 함수
 * @param categories 카테고리 노드 배열
 * @returns Map<number, string> 형태의 매핑 맵
 */
export const createCategoryDepartmentMap = (categories: CategoryNode[]): Map<number, string> => {
  const map = new Map<number, string>();
  
  const traverse = (nodes: CategoryNode[]) => {
    nodes.forEach((node) => {
      if (node.key !== -1 && node.department) { // -1은 루트 노드이므로 제외
        map.set(node.key, node.department);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  
  traverse(categories);
  return map;
};

/**
 * 카테고리 트리에서 키를 키로 하는 단위 매핑 맵을 생성하는 함수
 * @param categories 카테고리 노드 배열
 * @returns Map<number, string> 형태의 매핑 맵
 */
export const createCategoryUnitMap = (categories: CategoryNode[]): Map<number, string> => {
  const map = new Map<number, string>();
  
  const traverse = (nodes: CategoryNode[]) => {
    nodes.forEach((node) => {
      if (node.key !== -1 && node.unit) { // -1은 루트 노드이므로 제외
        map.set(node.key, node.unit);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  
  traverse(categories);
  return map;
};

/**
 * 분야명을 한글로 변환하는 함수
 * @param department 분야명 ('skin' | 'surgery')
 * @returns 한글 분야명
 */
export const getDepartmentDisplayName = (department: string | null): string => {
  switch (department) {
    case 'surgery':
      return '성형';
    case 'skin':
      return '피부';
    default:
      return department || '';
  }
};

/**
 * 분야별 스타일 클래스를 반환하는 함수
 * @param department 분야명 ('skin' | 'surgery')
 * @returns Tailwind CSS 클래스 문자열
 */
export const getDepartmentStyleClass = (department: string | null): string => {
  switch (department) {
    case 'surgery':
      return 'text-purple-700 bg-purple-100';
    case 'skin':
      return 'text-emerald-700 bg-emerald-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
}; 