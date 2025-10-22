import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const TERMS_VERSION = 'v2025-10-01';

type AgreeRequestBody = {
  marketingOptIn?: boolean;
};

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let body: AgreeRequestBody = {};
  try {
    body = await req.json();
  } catch (error) {
    // Ignore body parsing errors; body stays as default empty object.
  }

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const publicMetadata = {
      ...(clerkUser.publicMetadata || {}),
      terms_agreed: true,
      terms_version: TERMS_VERSION,
      terms_agreed_at: new Date().toISOString(),
      marketing_opt_in: body.marketingOptIn === true,
    };

    await clerkClient.users.updateUser(userId, { publicMetadata });

    return NextResponse.json({ ok: true, publicMetadata });
  } catch (error) {
    console.error('Failed to persist terms agreement', error);
    return new NextResponse('Failed to save agreement', { status: 500 });
  }
}
