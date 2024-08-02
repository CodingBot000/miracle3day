import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id_unique = params.id;
  const supabase = createClient();

  try {
    const { data, error, status, statusText } = await supabase
      .from("hospital")
      .select(
        `id_unique, name, latitude, longitude
        `
      )
      .match({ id_unique });

    const { data: detailData, error: detailError } = await supabase
      .from("hospital_details")
      .select(
        `
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

    return Response.json(
      {
        data: {
          ...data[0],
          hospital_details: detailData[0],
        },
      },
      { status: 200, statusText: "success" }
    );
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
