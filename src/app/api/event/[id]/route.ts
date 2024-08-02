import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const id_unique = params.id;

  try {
    const { data, error, status, statusText } = await supabase
      .from("event")
      .select("*", { count: "exact" })
      .match({ id_unique })
      .order("created_at", { ascending: true });

    if (!data || error) {
      return Response.json({ data: null }, { status, statusText });
    }

    const getSurgery = await supabase
      .from("surgery_info")
      .select("*")
      .in("id_unique", data[0].id_surgeries);

    const getHospital = await supabase
      .from("hospital")
      .select("*")
      .match({ id_unique: data[0].id_hospital });

    if (!getHospital.data) return;

    const updatedData = data.map((e) => {
      return {
        ...e,
        id_surgeries: getSurgery.data,
        id_hospital: getHospital.data[0],
      };
    });

    return Response.json({ data: updatedData }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
