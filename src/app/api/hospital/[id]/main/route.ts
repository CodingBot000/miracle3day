import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id_unique = params.id;
  const supabase = createClient();

  const { searchParams } = new URL(req.url);
  const uuid = searchParams.get("uuid") as string;

  try {
    const {
      data: hospitalData,
      error,
      status,
      statusText,
    } = await supabase
      .from("hospital")
      .select(
        `id_unique,
         imageurls,
         name,
         latitude,
         longitude
        `
      )
      .match({ id_unique });

    const { data: detailData, error: detailError } = await supabase
      .from("hospital_details")
      .select(
        `
        tel,
        homepage,
        kakaotalk,
        facebook,
        instagram,
        blog,
        youtube,
        ticktok,
        snapchat,
        map,
        desc_address,
        desc_openninghour,
        desc_facilities,
        desc_doctors_imgurls,
        id_hospital,
        etc
        `
      )
      .match({ id_hospital: id_unique });

    if (error || detailError) {
      return Response.json({ data: null }, { status, statusText });
    }

    if (!uuid || uuid === "undefined") {
      const data = {
        ...hospitalData[0],
        favorite: [],
        hospital_details: detailData,
      };

      return Response.json(data, { status: 200, statusText: "success" });
    }

    const { data: favoriteData, error: favoriteError } = await supabase
      .from("favorite")
      .select("*")
      .eq("uuid", uuid)
      .eq("id_hospital", id_unique);

    if (favoriteError) {
      return Response.json({ data: null }, { status, statusText });
    }

    const data = {
      ...hospitalData[0],
      favorite: favoriteData,
      hospital_details: detailData,
    };

    return Response.json(data, { status: 200, statusText: "success" });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
