import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  TopicListResponse,
  TopicDetailResponse,
  TopicWithAreas,
  AreaBasicInfo,
  AreaDetailContent,
  TreatmentRoot,
  TreatmentCareProtocolSchema,
  Benefits,
  BenefitInput,
  LocalizedText,
} from '@/app/models/treatmentData.dto';

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeLocalizedText = (
  value: unknown,
  fallback?: Partial<Record<string, unknown>>
): LocalizedText => {
  const normalized: LocalizedText = {};

  if (isRecord(value)) {
    Object.entries(value).forEach(([lang, raw]) => {
      if (raw === undefined) {
        return;
      }

      if (raw === null) {
        normalized[lang] = null;
        return;
      }

      if (typeof raw === 'string') {
        normalized[lang] = raw;
        return;
      }

      normalized[lang] = String(raw);
    });
  } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    normalized.ko = String(value);
  }

  if (fallback) {
    Object.entries(fallback).forEach(([lang, raw]) => {
      if (normalized[lang] !== undefined || raw === undefined) {
        return;
      }

      if (raw === null) {
        normalized[lang] = null;
        return;
      }

      if (typeof raw === 'string') {
        normalized[lang] = raw;
        return;
      }

      normalized[lang] = String(raw);
    });
  }

  return normalized;
};

const normalizeBenefitInput = (value: unknown): BenefitInput | null => {
  if (!isRecord(value)) {
    return null;
  }

  const title = normalizeLocalizedText(value.title);
  const meta = isRecord(value.meta) ? value.meta : undefined;

  return {
    title,
    ...(meta ? { meta } : {}),
  };
};

const normalizeBenefits = (
  raw: unknown,
  fallbackKo?: string | null,
  fallbackEn?: string | null
): Benefits => {
  if (isRecord(raw)) {
    const inputs = Array.isArray(raw.inputs)
      ? raw.inputs
          .map(normalizeBenefitInput)
          .filter((item): item is NonNullable<ReturnType<typeof normalizeBenefitInput>> => !!item)
      : [];

    const resultSource = isRecord(raw.result) ? raw.result : {};
    const resultTitle = normalizeLocalizedText(resultSource.title, {
      ...(fallbackKo !== undefined ? { ko: fallbackKo } : {}),
      ...(fallbackEn !== undefined ? { en: fallbackEn } : {}),
    });

    return {
      inputs,
      result: {
        title: resultTitle,
        ...(isRecord(resultSource.meta) ? { meta: resultSource.meta } : {}),
      },
    };
  }

  return {
    inputs: [],
    result: {
      title: normalizeLocalizedText(undefined, {
        ...(fallbackKo !== undefined ? { ko: fallbackKo } : {}),
        ...(fallbackEn !== undefined ? { en: fallbackEn } : {}),
      }),
    },
  };
};

export async function GET(request: NextRequest) {
  try {
    console.log('=== Treatment Care Protocols API Debug ===');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { searchParams } = new URL(request.url);
    
    const topic_id = searchParams.get('topic_id');
    const area_id = searchParams.get('area_id');
    
    // 문서 3절: 첫 화면용 쿼리 (토픽별 섹션 + 부위 목록)
    if (!topic_id && !area_id) {
      console.log('Fetching topic list with areas...');
      
      // Manual query following the documented pattern
      const { data: protocols, error } = await supabase
        .from('treatment_care_protocols')
        .select(`
          topic_id,
          topic_title_ko,
          topic_title_en,
          topic_sort_order,
          concern_copy_ko,
          concern_copy_en,
          area_id,
          area_name_ko,
          area_name_en,
          area_sort_order
        `)
        .order('topic_sort_order', { ascending: true })
        .order('area_sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching protocols:', error);
        return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
      }

      // Group by topic manually (following 문서 3절 pattern)
      const topicMap = new Map<string, TopicWithAreas>();
      
      protocols?.forEach(protocol => {
        if (!topicMap.has(protocol.topic_id)) {
          topicMap.set(protocol.topic_id, {
            topic_id: protocol.topic_id,
            topic_title_ko: protocol.topic_title_ko,
            topic_title_en: protocol.topic_title_en,
            topic_sort_order: protocol.topic_sort_order || 0,
            concern_copy_ko: protocol.concern_copy_ko,
            concern_copy_en: protocol.concern_copy_en,
            areas: []
          });
        }

        const topic = topicMap.get(protocol.topic_id)!;
        // Check if this area already exists to avoid duplicates
        const existingArea = topic.areas.find(area => area.area_id === protocol.area_id);
        if (!existingArea) {
          topic.areas.push({
            area_id: protocol.area_id,
            area_name_ko: protocol.area_name_ko,
            area_name_en: protocol.area_name_en,
            area_sort_order: protocol.area_sort_order || 0
          });
        }
      });

      const topics = Array.from(topicMap.values()).sort((a, b) => a.topic_sort_order - b.topic_sort_order);
      topics.forEach(topic => {
        topic.areas.sort((a, b) => a.area_sort_order - b.area_sort_order);
      });

      const response: TopicListResponse = { data: topics };
      return NextResponse.json(response);
    }

    // 문서 4절: 상세 화면용 쿼리 (토픽 전체 + 현재 부위 강조)
    if (topic_id && area_id) {
      console.log(`Fetching topic detail for topic_id: ${topic_id}, area_id: ${area_id}`);
      
      // Get all areas for the topic (for tabs)
      const { data: topicAreas, error: areasError } = await supabase
        .from('treatment_care_protocols')
        .select(`
          area_id,
          area_name_ko,
          area_name_en,
          area_sort_order
        `)
        .eq('topic_id', topic_id)
        .order('area_sort_order', { ascending: true });

      if (areasError) {
        console.error('Error fetching topic areas:', areasError);
        return NextResponse.json({ error: 'Failed to fetch topic areas' }, { status: 500 });
      }

      // Get current area content
      const { data: currentArea, error: contentError } = await supabase
        .from('treatment_care_protocols')
        .select('*')
        .eq('topic_id', topic_id)
        .eq('area_id', area_id)
        .single();

      if (contentError || !currentArea) {
        console.error('Error fetching current area:', contentError);
        return NextResponse.json({ error: 'Area not found' }, { status: 404 });
      }

      const normalizedArea = {
        ...currentArea,
        primary_treatment_ids: Array.isArray(currentArea.primary_treatment_ids) ? currentArea.primary_treatment_ids : [],
        alt_treatment_ids: Array.isArray(currentArea.alt_treatment_ids) ? currentArea.alt_treatment_ids : [],
        combo_treatment_ids: Array.isArray(currentArea.combo_treatment_ids) ? currentArea.combo_treatment_ids : [],
        benefits: normalizeBenefits(
          currentArea.benefits,
          currentArea.benefits_ko,
          currentArea.benefits_en
        ),
        cautions: normalizeLocalizedText(currentArea.cautions, {
          ...(currentArea.cautions_ko !== undefined ? { ko: currentArea.cautions_ko } : {}),
          ...(currentArea.cautions_en !== undefined ? { en: currentArea.cautions_en } : {}),
        }),
        sequence: Array.isArray(currentArea.sequence) ? currentArea.sequence : [],
        step_count: typeof currentArea.step_count === 'number'
          ? currentArea.step_count
          : Array.isArray(currentArea.sequence)
            ? currentArea.sequence.length
            : undefined,
      };

      const parsedProtocolResult = TreatmentCareProtocolSchema.safeParse(normalizedArea);

      if (!parsedProtocolResult.success) {
        console.error('Invalid protocol data:', parsedProtocolResult.error.flatten());
        return NextResponse.json({ error: 'Invalid protocol data' }, { status: 500 });
      }

      const protocol = parsedProtocolResult.data;

      // Resolve treatment IDs to full treatment objects with alias support (문서 5절)
      const allTreatmentIds = [
        ...protocol.primary_treatment_ids,
        ...protocol.alt_treatment_ids,
        ...protocol.combo_treatment_ids
      ];
      
      const uniqueTreatmentIds = Array.from(new Set(allTreatmentIds));
      
      // Helper function to resolve treatments with alias support
      const resolveTreatmentIds = async (ids: string[]): Promise<TreatmentRoot[]> => {
        if (ids.length === 0) return [];
        
        // First try to get treatments directly from treatments_root
        const { data: directTreatments, error: directError } = await supabase
          .from('treatments_root')
          .select('*')
          .in('id', ids);

        if (directError) {
          console.error('Error fetching direct treatments:', directError);
          return [];
        }

        const foundDirectIds = new Set(directTreatments?.map(t => t.id) || []);
        const missingIds = ids.filter(id => !foundDirectIds.has(id));
        
        let aliasResolvedTreatments: TreatmentRoot[] = [];
        
        // For missing IDs, try to resolve through aliases
        if (missingIds.length > 0) {
          const { data: aliases, error: aliasError } = await supabase
            .from('treatments_alias')
            .select(`
              alias_id,
              root_id,
              treatments_root!inner (*)
            `)
            .in('alias_id', missingIds);

          if (!aliasError && aliases) {
            aliasResolvedTreatments = aliases.map((alias: any) => alias.treatments_root);
          }
        }

        return [...(directTreatments || []), ...aliasResolvedTreatments];
      };

      // Resolve all treatments
      const [primaryTreatments, altTreatments, comboTreatments] = await Promise.all([
        resolveTreatmentIds(protocol.primary_treatment_ids),
        resolveTreatmentIds(protocol.alt_treatment_ids),
        resolveTreatmentIds(protocol.combo_treatment_ids)
      ]);

      const content: AreaDetailContent = {
        ...protocol,
        primary_treatments: primaryTreatments,
        alt_treatments: altTreatments,
        combo_treatments: comboTreatments
      };

      const response: TopicDetailResponse = {
        areas: topicAreas,
        content
      };

      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });

  } catch (error) {
    console.error('Unexpected error in treatment care protocols API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
