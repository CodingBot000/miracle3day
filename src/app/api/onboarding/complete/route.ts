import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { query } from '@/server/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const user = await currentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const done = (user.publicMetadata as any)?.onboarding_completed === true;
    if (done) {
      return NextResponse.json({ ok: true });
    }

    const email = user.emailAddresses?.[0]?.emailAddress ?? null;
    const isEmailVerified = !!user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.verification?.status;
    const avatar = user.imageUrl ?? null;
    const name = user.fullName ?? null;
    const nickname = body.nickname || name || null;

    const phone_country_code = body.phone_country_code || null;
    const phone_number = body.phone_number || null;
    const is_phone_verified = !!user.phoneNumbers?.[0]?.verification?.status;

    const id_country = body.id_country || null;
    const birth_date = body.birth_date || null;
    const gender = body.gender || null;
    const secondary_email = body.secondary_email || null;

    const auth_primary_provider = user.primaryEmailAddressId ? 'email' : (user.externalAccounts?.[0]?.provider ?? 'social');

    const provider_ids: Record<string, string> = {};
    user.externalAccounts?.forEach((acc) => {
      provider_ids[acc.provider] = acc.externalId ?? '';
    });

    const terms_version = (user.publicMetadata as any)?.terms_version ?? 'v2025-10-01';
    const terms_agreed_at = (user.publicMetadata as any)?.terms_agreed_at ?? new Date().toISOString();
    const marketingOptIn = (user.publicMetadata as any)?.marketing_opt_in === true;

    const terms_agreements = JSON.stringify({
      marketing_ads:   { agreed: marketingOptIn, required: false },
      personal_info:   { agreed: true, required: true },
      location_terms:  { agreed: true, required: true },
      age_14_or_older: { agreed: true, required: true },
      terms_of_service:{ agreed: true, required: true },
    });

    const values = [
      auth_primary_provider,
      JSON.stringify(provider_ids),
      email,
      isEmailVerified,
      user.passwordEnabled ?? false,
      name,
      nickname,
      avatar,
      phone_country_code,
      phone_number,
      is_phone_verified,
      id_country,
      birth_date,
      gender,
      terms_agreements,
      terms_version,
      terms_agreed_at,
      secondary_email,
    ];

    const existingMember = await query(
      'SELECT id_uuid FROM public.members WHERE clerk_user_id = $1',
      [user.id]
    );

    let memberId = existingMember.rows[0]?.id_uuid as string | undefined;

    if (memberId) {
      await query(
        `UPDATE public.members SET
          auth_primary_provider = $1,
          provider_ids = $2::jsonb,
          email = $3,
          is_email_verified = $4,
          has_password = $5,
          name = $6,
          nickname = $7,
          avatar = $8,
          phone_country_code = $9,
          phone_number = $10,
          is_phone_verified = $11,
          id_country = $12,
          birth_date = $13,
          gender = $14,
          terms_agreements = $15::jsonb,
          terms_version = $16,
          terms_agreed_at = $17,
          secondary_email = $18,
          updated_at = now()
        WHERE clerk_user_id = $19`,
        [...values, user.id]
      );
    } else {
      const insertMembers = `
        INSERT INTO public.members (
          clerk_user_id,
          auth_primary_provider,
          provider_ids,
          email,
          is_email_verified,
          has_password,
          name,
          nickname,
          avatar,
          phone_country_code,
          phone_number,
          is_phone_verified,
          id_country,
          birth_date,
          gender,
          terms_agreements,
          terms_version,
          terms_agreed_at,
          secondary_email,
          created_at,
          updated_at
        ) VALUES (
          $1,
          $2,
          $3::jsonb,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16::jsonb,
          $17,
          $18,
          $19,
          now(),
          now()
        )
        RETURNING id_uuid;
      `;

      const memberInsert = await query(insertMembers, [user.id, ...values]);
      memberId = memberInsert.rows[0]?.id_uuid;
    }

    const externalAccounts = user.externalAccounts || [];
    if (memberId && externalAccounts.length > 0) {
      const socialSql = `
        INSERT INTO public.member_social_accounts (
          member_id_uuid,
          provider,
          provider_user_id,
          provider_email,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, now(), now())
        ON CONFLICT DO NOTHING;
      `;

      for (const acc of externalAccounts) {
        await query(socialSql, [
          memberId, 
          acc.provider, 
          acc.externalId ?? null, 
          acc.emailAddress ?? null]);
      }
    }

    // ✅ Clerk 업데이트: 권장 방식
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...(user.publicMetadata || {}),
        onboarding_completed: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Onboarding complete error:', error);
    return new NextResponse(message, { status: 500 });
  }
}
