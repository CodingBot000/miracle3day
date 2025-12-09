import { NextRequest, NextResponse } from 'next/server';
import "@/utils/logger"; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: '주소가 필요합니다' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('카카오 API 응답 오류:', response.status, response.statusText);
      return NextResponse.json(
        { error: '주소 변환 실패', status: response.status }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
      const location = data.documents[0];
      const coordinates = {
        latitude: parseFloat(location.y),
        longitude: parseFloat(location.x)
      };
      
      return NextResponse.json({ coordinates });
    } else {
      return NextResponse.json({ error: '좌표를 찾을 수 없습니다' }, { status: 404 });
    }
  } catch (error) {
    console.error('주소 -> 좌표 변환 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
} 