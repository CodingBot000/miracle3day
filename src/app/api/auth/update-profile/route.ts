import { TABLE_MEMBERS } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";
import { country } from "@/constants/country";

export async function PUT(req: Request) {
  const supabase = createClient();

  try {
    const body = await req.json();
    const { uuid, displayName, fullName, nation, birthYear, birthMonth, birthDay, gender, email } = body;

    console.log('Update Profile Request:', { 
      uuid, displayName, fullName, nation, 
      birthYear, birthMonth, birthDay, gender, email 
    });

    if (!uuid) {
      throw new Error("UUID is required");
    }

    // 국가 코드로 id_country 찾기
    const countryData = country.find((c) => c.country_code === nation);
    if (!nation || !countryData) {
      throw new Error("Invalid country code");
    }

    // 생년월일 포맷팅
    const paddedMonth = String(birthMonth).padStart(2, '0');
    const paddedDay = String(birthDay).padStart(2, '0');
    const birthDate = `${birthYear}-${paddedMonth}-${paddedDay}`;

    // 업데이트할 데이터 객체 생성
    const updateData: Record<string, any> = {
      nickname: displayName,
      id_country: countryData.id,
      birth_date: birthDate,
      gender: gender,
      updated_at: new Date().toISOString()
    };

    // 선택적 필드는 값이 있을 때만 포함
    if (fullName?.trim()) {
      updateData.name = fullName;
    }
    
    if (email?.trim()) {
      updateData.secondary_email = email;
    }

    console.log('Update Data:', updateData);

    const { data, error } = await supabase
      .from(TABLE_MEMBERS)
      .update(updateData)
      .eq('uuid', uuid)
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return Response.json(
        { error: error.message },
        { status: error.code === "23505" ? 409 : 500 }
      );
    }

    return Response.json({ data });
  } catch (error) {
    console.error('Server Error:', error);
    if (error instanceof Error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return Response.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
} 