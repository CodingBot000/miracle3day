import { NextRequest, NextResponse } from 'next/server';
import { YouCamSkinAnalysis } from '../lib/skin-analysis';
import { ResultParser } from '../lib/result-parser';
import { SkinConcern } from '../lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const concernsString = formData.get('concerns') as string;
    let mode = formData.get('mode') as 'SD' | 'HD' | undefined;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'Image file is required' },
        { status: 400 }
      );
    }

    if (!concernsString) {
      return NextResponse.json(
        { success: false, error: 'Skin concerns are required' },
        { status: 400 }
      );
    }

    let concerns: SkinConcern[];
    try {
      concerns = JSON.parse(concernsString) as SkinConcern[];
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid concerns format' },
        { status: 400 }
      );
    }

    const validCounts = [4, 7, 14];
    if (!validCounts.includes(concerns.length)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Must select exactly 4, 7, or 14 concerns. You selected ${concerns.length}` 
        },
        { status: 400 }
      );
    }

    if (mode === 'HD' && !concerns.every(c => c.startsWith('HD_'))) {
      concerns = concerns.map(c => 
        c.startsWith('HD_') ? c : `HD_${c}` as SkinConcern
      );
    } else if (!mode && concerns.some(c => c.startsWith('HD_'))) {
      mode = 'HD';
    }

    const skinAnalysis = new YouCamSkinAnalysis();

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    
    const analysisResult = await skinAnalysis.performFullAnalysis(
      imageBuffer,
      concerns,
      mode || 'SD'
    );

    const parsedResult = await ResultParser.parseZipResults(analysisResult.zipData);
    
    const clientResponse = ResultParser.formatClientResponse(parsedResult);

    return NextResponse.json({
      success: true,
      data: clientResponse,
    });

  } catch (error) {
    console.error('Skin analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'YouCam Skin Analysis API',
    endpoints: {
      POST: {
        description: 'Analyze skin from uploaded image',
        parameters: {
          image: 'Image file (required)',
          concerns: 'JSON array of skin concerns (4, 7, or 14 items)',
          mode: 'SD or HD (optional)',
        },
        availableConcerns: {
          SD: [
            'Wrinkle', 'Droopy_upper_eyelid', 'Firmness', 'Acne',
            'Moisture', 'Eye_bag', 'Dark_circle', 'Spots',
            'Radiance', 'Redness', 'Oiliness', 'Pore', 'Texture'
          ],
          HD: [
            'HD_Wrinkle', 'HD_Droopy_upper_eyelid', 'HD_Firmness', 'HD_Acne',
            'HD_Moisture', 'HD_Eye_bag', 'HD_Dark_circle', 'HD_Spots',
            'HD_Radiance', 'HD_Redness', 'HD_Oiliness', 'HD_Pore', 'HD_Texture'
          ],
        },
      },
    },
  });
}