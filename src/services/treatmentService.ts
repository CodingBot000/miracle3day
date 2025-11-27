import { log } from '@/utils/logger';
import {
  GetTreatmentCareProtocolsParams,
  GetTreatmentCareProtocolsResponse,
  TreatmentCategoryResponse,
  TreatmentAreaResponse,
  TopicListResponse,
  TopicDetailResponse,
  Benefits,
  LocalizedText,
  TreatmentRoot,
  SequenceStep,
  TreatmentAttributes,
  AreaDetailContent,
} from "@/app/models/treatmentData.dto";

type RawProtocolRow = {
  id: string;
  topic_id: string;
  topic_title_ko: string;
  topic_title_en: string;
  topic_sort_order?: number | null;
  concern_copy_ko?: string | null;
  concern_copy_en?: string | null;
  area_id: string;
  area_name_ko: string;
  area_name_en: string;
  area_sort_order?: number | null;
  primary_treatment_ids?: string[] | null;
  alt_treatment_ids?: string[] | null;
  combo_treatment_ids?: string[] | null;
  benefits?: Benefits | null;
  benefits_ko?: string | null;
  benefits_en?: string | null;
  sequence?: SequenceStep[] | null;
  cautions?: LocalizedText | null;
  cautions_ko?: string | null;
  cautions_en?: string | null;
  meta?: Record<string, unknown> | null;
  step_count?: number | null;
};

type TreatmentRootApiRow = TreatmentRoot & {
  requested_id: string;
  alias_id: string | null;
};

const DEFAULT_LIMIT = 200;

const isRecord = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const ensureArray = <T = unknown>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  return [];
};

class TreatmentService {
  // 기존 상대경로 → 절대경로로 변경
  private baseUrl =
    (typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_ROUTE
      : window.location.origin) + "/api/treatment_care_protocols";

  async getTreatmentCareProtocols(
    params?: GetTreatmentCareProtocolsParams
  ): Promise<GetTreatmentCareProtocolsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.topic_id) searchParams.set("eq.topic_id", params.topic_id);
    if (params?.area_id) searchParams.set("eq.area_id", params.area_id);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const url = `${this.baseUrl}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    // ✅ Redirect loop 방지: 절대 URL + cache: no-store + redirect: follow
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      console.error("[TreatmentService] fetch failed:", response.status, url);
      throw new Error(
        `Failed to fetch treatment care protocols: ${response.statusText}`
      );
    }

    const rows: RawProtocolRow[] = await response.json();

    if (!Array.isArray(rows) || !rows.length) {
      return { data: [], total: 0, has_more: false };
    }

    const uniqueTreatmentIds = this.collectTreatmentIds(rows);
    const treatmentLookup = await this.fetchTreatmentRoots(uniqueTreatmentIds);

    const topicMap = new Map<string, TreatmentCategoryResponse>();

    for (const row of rows) {
      const topic = this.ensureTopic(topicMap, row);
      const area = this.buildArea(row, treatmentLookup);
      topic.areas.push(area);
    }

    const categories = Array.from(topicMap.values()).map((category) => ({
      ...category,
      areas: [...category.areas].sort(
        (a, b) => (a.area_sort_order ?? 0) - (b.area_sort_order ?? 0)
      ),
    }));

    categories.sort(
      (a, b) => (a.topic_sort_order ?? 0) - (b.topic_sort_order ?? 0)
    );

    const limit = params?.limit ?? DEFAULT_LIMIT;

    return {
      data: categories,
      total: rows.length,
      has_more: rows.length === limit,
    };
  }

  async getTreatmentCareProtocolsByTopic(topic_id: string): Promise<TreatmentCategoryResponse[]> {
    const result = await this.getTreatmentCareProtocols({ topic_id });
    return result.data;
  }

  async getAllTreatmentCategories(): Promise<TreatmentCategoryResponse[]> {
    const result = await this.getTreatmentCareProtocols();
    return result.data;
  }

  async getTopicDetail(topicId: string, areaId: string): Promise<TopicDetailResponse> {
    const { data } = await this.getTreatmentCareProtocols({ topic_id: topicId });
    const category = data.find(topic => topic.topic_id === topicId);

    if (!category) {
      throw new Error(`Topic "${topicId}" not found`);
    }

    // Debug: Log available areas
    log.debug(`[TreatmentService] Looking for area_id: "${areaId}" in topic "${topicId}"`);
    log.debug(`[TreatmentService] Available areas:`, category.areas.map(a => ({
      area_id: a.area_id,
      area_name_ko: a.area_name_ko,
      sequence_length: Array.isArray(a.sequence) ? a.sequence.length : 'not array',
      sequence: a.sequence
    })));

    const areas = category.areas
      .map(area => ({
        area_id: area.area_id,
        area_name_ko: area.area_name_ko,
        area_name_en: area.area_name_en,
        area_sort_order: area.area_sort_order ?? 0,
      }))
      .sort((a, b) => (a.area_sort_order ?? 0) - (b.area_sort_order ?? 0));

    const targetArea =
      category.areas.find(area => area.area_id === areaId) ?? category.areas[0];

    if (!targetArea) {
      throw new Error(`Area not found for topic "${topicId}"`);
    }

    log.debug(`[TreatmentService] Found targetArea:`, {
      area_id: targetArea.area_id,
      requested_area_id: areaId,
      match: targetArea.area_id === areaId,
      sequence_length: Array.isArray(targetArea.sequence) ? targetArea.sequence.length : 'not array',
      sequence: targetArea.sequence
    });

    const primaryTreatments = targetArea.primary_treatments ?? [];
    const altTreatments = targetArea.alt_treatments ?? [];
    const comboTreatments = targetArea.combo_treatments ?? [];

    const benefits: Benefits = targetArea.benefits ?? {
      inputs: [],
      result: { title: { ko: null, en: null } },
    };

    const cautions: LocalizedText = targetArea.cautions ?? { ko: null, en: null };
    const stepCount = targetArea.step_count ?? (primaryTreatments.length || undefined);

    const content: AreaDetailContent = {
      id: `${category.topic_id}__${targetArea.area_id}`,
      topic_id: category.topic_id,
      topic_title_ko: category.topic_title_ko,
      topic_title_en: category.topic_title_en,
      topic_sort_order: category.topic_sort_order ?? 0,
      concern_copy_ko: category.concern_copy_ko ?? "",
      concern_copy_en: category.concern_copy_en ?? "",
      area_id: targetArea.area_id,
      area_name_ko: targetArea.area_name_ko,
      area_name_en: targetArea.area_name_en,
      area_sort_order: targetArea.area_sort_order ?? 0,
      primary_treatment_ids: primaryTreatments.map(t => t.id),
      alt_treatment_ids: altTreatments.map(t => t.id),
      combo_treatment_ids: comboTreatments.map(t => t.id),
      benefits,
      sequence: targetArea.sequence ?? [],
      cautions,
      meta: targetArea.meta,
      step_count: stepCount,
      primary_treatments: primaryTreatments,
      alt_treatments: altTreatments,
      combo_treatments: comboTreatments,
    };

    return { areas, content };
  }

  async getTopicList(limit = DEFAULT_LIMIT): Promise<TopicListResponse> {
    const { data } = await this.getTreatmentCareProtocols({ limit });

    const topics = data
      .map(category => ({
        topic_id: category.topic_id,
        topic_title_ko: category.topic_title_ko,
        topic_title_en: category.topic_title_en,
        topic_sort_order: category.topic_sort_order ?? 0,
        concern_copy_ko: category.concern_copy_ko,
        concern_copy_en: category.concern_copy_en,
        areas: category.areas
          .map(area => ({
            area_id: area.area_id,
            area_name_ko: area.area_name_ko,
            area_name_en: area.area_name_en,
            area_sort_order: area.area_sort_order,
          }))
          .sort((a, b) => (a.area_sort_order ?? 0) - (b.area_sort_order ?? 0)),
      }))
      .sort((a, b) => (a.topic_sort_order ?? 0) - (b.topic_sort_order ?? 0));

    return { data: topics };
  }

  private collectTreatmentIds(rows: RawProtocolRow[]): string[] {
    const ids = new Set<string>();
    const append = (list?: string[] | null) => {
      if (!list) return;
      list.filter(Boolean).forEach(id => ids.add(id));
    };

    rows.forEach(row => {
      append(row.primary_treatment_ids);
      append(row.alt_treatment_ids);
      append(row.combo_treatment_ids);
    });

    return Array.from(ids);
  }

  private async fetchTreatmentRoots(ids: string[]): Promise<Map<string, TreatmentRoot>> {
    const map = new Map<string, TreatmentRoot>();
    if (!ids.length) return map;

    // ✅ 절대경로 자동 처리 (서버 vs 브라우저 구분)
    const base =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_API_ROUTE
        : window.location.origin;

    const url = `${base}/api/treatments_root?ids=${encodeURIComponent(ids.join(","))}`;
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",      // ✅ 캐시 방지
        redirect: "follow",     // ✅ 308/307 루프 방지
      });

      if (!res.ok) {
        console.error("[TreatmentService] Failed to fetch treatments_root:", res.status, url);
        return map;
      }

      const payload = await res.json();
      const data: TreatmentRootApiRow[] = Array.isArray(payload?.data) ? payload.data : [];

      data.forEach((item) => {
        const attributes = (isRecord(item.attributes)
          ? (item.attributes as TreatmentAttributes)
          : {}) as TreatmentAttributes;

        const treatment: TreatmentRoot = {
          id: item.id,
          ko: item.ko,
          en: item.en,
          group_id: item.group_id,
          summary: (isRecord(item.summary) ? item.summary : {}) as Record<string, string>,
          tags: ensureArray<string>(item.tags),
          attributes,
          created_at: item.created_at ?? undefined,
          updated_at: item.updated_at ?? undefined,
        };

        map.set(item.id, treatment);
        map.set(item.requested_id, treatment);
        if (item.alias_id) map.set(item.alias_id, treatment);
      });
    } catch (error) {
      console.error("[TreatmentService] fetchTreatmentRoots error:", error);
    }

    return map;
  }

  
  private ensureTopic(topicMap: Map<string, TreatmentCategoryResponse>, row: RawProtocolRow): TreatmentCategoryResponse {
    let topic = topicMap.get(row.topic_id);
    if (!topic) {
      topic = {
        topic_id: row.topic_id,
        topic_title_ko: row.topic_title_ko,
        topic_title_en: row.topic_title_en,
        topic_sort_order: row.topic_sort_order ?? 0,
        concern_copy_ko: row.concern_copy_ko ?? undefined,
        concern_copy_en: row.concern_copy_en ?? undefined,
        areas: [],
      };
      topicMap.set(row.topic_id, topic);
    }
    return topic;
  }

  private buildArea(row: RawProtocolRow, treatmentLookup: Map<string, TreatmentRoot>): TreatmentAreaResponse {
    const primary = this.resolveTreatments(row.primary_treatment_ids, treatmentLookup);
    const alt = this.resolveTreatments(row.alt_treatment_ids, treatmentLookup);
    const combo = this.resolveTreatments(row.combo_treatment_ids, treatmentLookup);

    const benefits = this.normalizeBenefits(row);
    const normalizedBenefits: Benefits = benefits ?? {
      inputs: [],
      result: {
        title: { ko: null, en: null },
      },
    };
    const sequence = Array.isArray(row.sequence) ? row.sequence : [];
    const cautions = this.normalizeCautions(row);
    const meta = isRecord(row.meta) ? row.meta : undefined;
    const stepCount = row.step_count ?? (sequence.length || undefined);

    return {
      area_id: row.area_id,
      area_name_ko: row.area_name_ko,
      area_name_en: row.area_name_en,
      area_sort_order: row.area_sort_order ?? 0,
      primary_treatments: primary,
      alt_treatments: alt,
      combo_treatments: combo,
      benefits: normalizedBenefits,
      sequence,
      cautions,
      meta,
      step_count: stepCount,
    };
  }

  private resolveTreatments(ids: string[] | null | undefined, lookup: Map<string, TreatmentRoot>): TreatmentRoot[] {
    if (!ids || !ids.length) return [];
    const seen = new Set<string>();
    const results: TreatmentRoot[] = [];

    ids.forEach(id => {
      if (!id || seen.has(id)) return;
      seen.add(id);
      const treatment = lookup.get(id);
      if (treatment) {
        results.push(treatment);
      }
    });

    return results;
  }

  private normalizeBenefits(row: RawProtocolRow): Benefits | undefined {
    if (row.benefits && typeof row.benefits === "object") {
      return row.benefits;
    }

    const ko = (row as any).benefits_ko;
    const en = (row as any).benefits_en;
    if (!ko && !en) {
      return undefined;
    }

    return {
      inputs: [],
      result: {
        title: {
          ko: ko ?? null,
          en: en ?? null,
        },
      },
    };
  }

  private normalizeCautions(row: RawProtocolRow): LocalizedText {
    if (row.cautions && typeof row.cautions === "object") {
      return row.cautions;
    }

    const ko = (row as any).cautions_ko;
    const en = (row as any).cautions_en;
    return { ko: ko ?? null, en: en ?? null };
  }
}

export const treatmentService = new TreatmentService();
