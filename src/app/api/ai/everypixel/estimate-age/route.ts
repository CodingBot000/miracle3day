import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // const { imageUrl } = await req.json();
  let imageUrl;
  try {
    const json = await req.json();
    console.log('JSON 파싱 성공:', json);
    imageUrl = json.imageUrl;
  } catch (err) {
    console.error('JSON 파싱 실패:', err);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
  }
  console.log('[API] imageUrl:', imageUrl);

  const clientId = process.env.EVERY_PIXEL_CLIENT_ID;
  const secretKey = process.env.EVERY_PIXEL_SECRET_KEY;

  if (!clientId || !secretKey) {
    console.error('Missing credentials');
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const authString = Buffer.from(`${clientId}:${secretKey}`).toString('base64');

  try {
    const apiResponse = await fetch('https://api.everypixel.com/v1/face-detection', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    const data = await apiResponse.json();
    console.log('API call success:', data);
    return NextResponse.json(data, { status: apiResponse.status });
  } catch (err) {
    console.error('API call failed:', err);
    return NextResponse.json({ error: 'API call failed' }, { status: 500 });
  }
}
//https://tqyarvckzieoraneohvv.supabase.co/storage/v1/object/public/images/images/doctors/95cc2bb6-c42c-42e0-a625-b5ef60025054/doctor_fffff_3e01f3f3_1753445190187.png
 