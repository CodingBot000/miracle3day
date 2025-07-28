'use server';

import { useUserStore } from '@/stores/useUserStore';
import { adminsAuthClient } from '@/utils/supabase/admins';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function withdrawAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("withdrawAction user: ", user);
  if (!user) {
    throw new Error("Not authenticated");
  }

  const uuid = user.id;

  // 1. 사용자 정보 삭제
  await supabase.from("members").delete().eq("uuid", uuid);

  // 2. 사용자 인증 계정 삭제 (serviceRole 키 필요 시 변경)
  // const adminClient = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
  // );
  useUserStore.getState().clearUser();
  await adminsAuthClient.deleteUser(uuid);

  // 3. 세션 종료
  await supabase.auth.signOut();

  // 4. 홈으로 이동
  redirect('/');
}
