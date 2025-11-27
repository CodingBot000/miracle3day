import { log } from '@/utils/logger';
import { ParsedAnalysisResult, ScoreInfo, SkinConcern, SkinScore } from './types';
import { promisify } from 'util';
import { unzip } from 'zlib';

const unzipAsync = promisify(unzip);

export class ResultParser {
  private static getConcernDisplayName(concern: string): string {
    const nameMap: Record<string, string> = {
      // Lowercase API response keys to display names
      'wrinkle': 'Wrinkles',
      'hd_wrinkle': 'Wrinkles (HD)',
      'droopy_upper_eyelid': 'Droopy Eyelids',
      'hd_droopy_upper_eyelid': 'Droopy Eyelids (HD)',
      'firmness': 'Firmness',
      'hd_firmness': 'Firmness (HD)',
      'acne': 'Acne',
      'hd_acne': 'Acne (HD)',
      'moisture': 'Moisture',
      'hd_moisture': 'Moisture (HD)',
      'eye_bag': 'Eye Bags',
      'hd_eye_bag': 'Eye Bags (HD)',
      'dark_circle': 'Dark Circles',
      'hd_dark_circle': 'Dark Circles (HD)',
      'spots': 'Age Spots',
      'hd_spots': 'Age Spots (HD)',
      'radiance': 'Radiance',
      'hd_radiance': 'Radiance (HD)',
      'redness': 'Redness',
      'hd_redness': 'Redness (HD)',
      'oiliness': 'Oiliness',
      'hd_oiliness': 'Oiliness (HD)',
      'pore': 'Pore Visibility',
      'hd_pore': 'Pore Visibility (HD)',
      'texture': 'Texture',
      'hd_texture': 'Texture (HD)',
    };
    
    return nameMap[concern] || concern;
  }

  public static async parseZipResults(zipData: Buffer): Promise<ParsedAnalysisResult> {
    const JSZip = await import('jszip');
    const zip = new JSZip.default();
    
    await zip.loadAsync(zipData);

    // Try different possible paths for score_info.json
    let scoreFile = zip.file('score_info.json');
    if (!scoreFile) {
      scoreFile = zip.file('skinanalysisResult/score_info.json');
    }
    
    if (!scoreFile) {
      log.debug('Available files in ZIP:', Object.keys(zip.files));
      throw new Error('score_info.json not found in results');
    }

    const scoreContent = await scoreFile.async('string');
    log.debug('Score content:', scoreContent);
    const scoreInfo: ScoreInfo = JSON.parse(scoreContent);

    const maskImages = new Map<string, Buffer>();
    const concerns: Array<{
      name: string;
      rawScore: number;
      uiScore: number;
      maskImage?: string;
    }> = [];

    // Parse the new JSON format
    for (const [key, value] of Object.entries(scoreInfo)) {
      // Skip special keys
      if (key === 'all' || key === 'skin_age') {
        continue;
      }
      
      // Check if it's a skin concern score
      if (typeof value === 'object' && 'raw_score' in value && 'ui_score' in value) {
        const score = value as SkinScore;
        
        concerns.push({
          name: this.getConcernDisplayName(key),
          rawScore: score.raw_score,
          uiScore: score.ui_score,
          maskImage: score.output_mask_name,
        });

        // Load mask image if available
        if (score.output_mask_name) {
          // Try different possible paths for mask files
          let maskFile = zip.file(score.output_mask_name);
          if (!maskFile) {
            maskFile = zip.file(`skinanalysisResult/${score.output_mask_name}`);
          }
          
          if (maskFile) {
            const maskData = await maskFile.async('nodebuffer');
            maskImages.set(score.output_mask_name, maskData);
          } else {
            log.debug(`Mask file not found: ${score.output_mask_name}`);
          }
        }
      }
    }

    return {
      overallScore: scoreInfo.all.score,
      skinAge: scoreInfo.skin_age,
      concerns,
      maskImages,
    };
  }

  public static getSeverityLevel(score: number): 'low' | 'medium' | 'high' {
    if (score <= 33) return 'low';
    if (score <= 66) return 'medium';
    return 'high';
  }

  public static formatClientResponse(
    parsedResult: ParsedAnalysisResult
  ): {
    overallScore: number;
    skinAge?: number;
    concerns: Array<{
      name: string;
      score: number;
      severity: 'low' | 'medium' | 'high';
    }>;
  } {
    return {
      overallScore: parsedResult.overallScore,
      skinAge: parsedResult.skinAge,
      concerns: parsedResult.concerns.map(concern => ({
        name: concern.name,
        score: concern.uiScore,
        severity: this.getSeverityLevel(concern.uiScore),
      })),
    };
  }
}
