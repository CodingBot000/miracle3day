import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = createClient();

  const { searchParams } = new URL(req.url);
  const locationNum = searchParams.get("locationNum");

  const { data = [], count } = await supabase
    .from("hospital")
    .select("imageurls, name, location, id_unique", { count: "exact" })
    .match({ location: locationNum })
    .limit(9);

  const response = {
    data,
    total: count,
  };

  return Response.json({ ...response });
}
