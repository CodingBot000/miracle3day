import { CategoryNode } from '@/models/admin/category';
import { NextResponse } from 'next/server';
import { TABLE_TREATMENT_INFO } from '@/constants/tables';
import { pool } from '@/lib/db';
import { log } from "@/utils/logger";

export async function GET() {
  const apiStartTime = Date.now();
  log.info("Treatment Categories API 시작:", new Date().toISOString());
  
  const dbQueryStart = Date.now();
  const { rows: data } = await pool.query(
    `SELECT code, department, level1, name, unit FROM ${TABLE_TREATMENT_INFO}`
  );
  
  const dbQueryEnd = Date.now();
  const dbQueryTime = dbQueryEnd - dbQueryStart;
  log.info(` DB 쿼리 시간: ${dbQueryTime}ms`);
  log.info(` 조회된 데이터 개수: ${data?.length || 0}`);

  const transformStart = Date.now();
  log.info("데이터 변환 시작");
  
  // group by level1 (level2는 더 이상 없음)
  const level1Map = new Map<string, any[]>();

  for (const row of data) {
    if (!level1Map.has(row.level1)) {
      level1Map.set(row.level1, []);
    }
    level1Map.get(row.level1)!.push({
      key: row.code,
      name: row.name,
      label: row.name,
      unit: row.unit, // unit 추가
      department: row.department, // department 추가
    });
  }

  const TREATMENT_CATEGORIES: CategoryNode[] = [];

  for (const [level1, items] of Array.from(level1Map.entries())) {
    TREATMENT_CATEGORIES.push({
      key: -1,
      name: level1,
      label: level1,
      children: items,
    });
  }

  const transformEnd = Date.now();
  const transformTime = transformEnd - transformStart;
  log.info(` 데이터 변환 시간: ${transformTime}ms`);
  
  const apiEndTime = Date.now();
  const totalApiTime = apiEndTime - apiStartTime;
  log.info(` Treatment Categories API 완료: ${totalApiTime}ms`);
  log.info(` 최종 카테고리 개수: ${TREATMENT_CATEGORIES.length}`);

  return NextResponse.json(TREATMENT_CATEGORIES);
}
