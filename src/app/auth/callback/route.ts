import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";
import { ROUTE } from "@/router";
import { TABLE_MEMBERS } from "@/constants/tables";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  // Supabase에서 리디렉션된 URL에 포함된 code와 next(원래 가려고 했던 경로)를 꺼내기
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";


  if (code) {
    //이 code로 Supabase의 session(로그인 상태)을 교환. 이걸 해야 로그인 완료 상태가됨
    const supabase = createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!sessionError) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const { data: userInfo } = await supabase.auth.getUserIdentities(); // 더 자세한 정보
      console.log(`auth callback route.ts userInfo: ${userInfo}`);
      console.log(`auth callback route.ts userInfo: ${user}`);
      console.log(`auth callback route.ts userError: ${userError}`);
      if (!userError && user) {
        const { id } = user;
        
        const { data: userRowExist, error: userRowExistError, count } = await supabase
        .from(TABLE_MEMBERS)
        .select("uuid", { count: "exact", head: true }) // head: true → data 없이 count만
        .eq("uuid", id);
      
        const alreadyJoinedUser = (count ?? 0) > 0;

        

        const { email, user_metadata, app_metadata } = user;
        const { full_name, avatar_url } = user_metadata ?? {};
        const provider = app_metadata?.provider ?? "email";
      
        console.log(userInfo);
        // 유저가 이미 가입했는데, SNS계정 정보를 변경했다면, 기존 MEMBERS테이블의 정보를 업데이트해야할까??
        //일단 개인정보이니 원하지않을수있으니 안하는게 맞을수도..

        if (!alreadyJoinedUser) {
          // 사용자 정보 DB에 upsert 소셜로그인에서는 생일, 성별 국가 등 정보가 이 타이밍에 가져올수없음
          await supabase.from(TABLE_MEMBERS).upsert({
            uuid: user.id, // auth.users.id → foreign key
            email: user.email ?? "",
            name: user.user_metadata?.full_name ?? "",         // 이름 (Google/Apple 등에서 옴)
            nickname: user.user_metadata?.name ?? "",          // 일반적으로 닉네임 (Apple, Facebook 등)
            avatar: user.user_metadata?.avatar_url ?? "",      // 프로필 사진
            provider: user.app_metadata?.provider ?? "",       // "google", "apple", "email" 등
            last_login_at: new Date().toISOString(),           // 현재 로그인 시간
            updated_at: new Date().toISOString(),              // 레코드 수정 시간

            // birth_date: birthDateInput, // 예: "1990-01-01"
            // gender: genderInput,         // 예: "male" | "female" | "other"
            // secondary_email: secondaryEmailInput ?? null,
          });
          
// 아래는 별도로
// user_no
// id_country

        // const { id } = user;

          //  user 테이블에서 추가정보 입력 여부 확인 소셜로그인에서는 생일, 성별 국가 등 정보가 가입하는 순간에는 갖고올수없어서 이미 입력했는지 여부를 확인해야함
          const { data: userRow } = await supabase
          .from(TABLE_MEMBERS)
          .select("id_country, birth_date, gender, secondary_email") // 생년월일, 성별 등도 추가 가능
          .eq("uuid", id)
          .maybeSingle();


          const needsProfileSetup = !userRow?.id_country || !userRow?.birth_date || !userRow?.gender || !userRow?.secondary_email;
          
          console.log(`auth callback route.ts userRow: ${userRow}`);
          console.log(`auth callback route.ts needsProfileSetup: ${needsProfileSetup}`);
          //추가 정보 필요 → /onboarding/complete-profile로 리디렉션
          if (needsProfileSetup) {
                                          
            const redirectUrl = `${origin}/onboarding/complete-profile?code=${id}/returnUrl=/`;
            console.log("auth callbacek needsProfileSetup move to :", redirectUrl);
            return NextResponse.redirect(redirectUrl);
          }
          console.log("auth callback this is if (needsProfileSetup) next step needsProfileSetup :", `${needsProfileSetup}`);

        }
      }
      console.log("auth callback out 1");
      //세션 교환에 성공하면, 환경에 따라 origin + next 또는 x-forwarded-host + next로 리디렉션
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        console.log("auth callback isLocalEnv :", `${origin}${next}`);
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        console.log("auth callback forwardedHost : ", `${forwardedHost}${next}`);
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        console.log("auth callback else : ", `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}${ROUTE.LOGIN}`);
}
