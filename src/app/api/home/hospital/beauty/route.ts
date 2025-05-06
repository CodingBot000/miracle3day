import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();

  try {
    const { data } = await supabase
      .from("hospital")
      .select("imageurls, name, id_unique, location")
      // .order("created_at", { ascending: false })
      .limit(6);

      
      // console.log(`data![0].location: ${data![0].location}`);
    return Response.json({ data }, { status: 200, statusText: "success" });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
