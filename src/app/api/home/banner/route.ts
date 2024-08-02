import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();

  const bannerShow = await supabase
    .from("banner_show")
    .select("id_banneritems");

  if (bannerShow.error) {
    return Response.json(
      { data: null },
      { status: bannerShow.status, statusText: bannerShow.statusText }
    );
  }

  const id_banneritems = bannerShow.data.flatMap((bs) => bs.id_banneritems);

  const { data, error, status, statusText } = await supabase
    .from("banner_item")
    .select("*")
    .in("id_unique", id_banneritems);

  if (error) {
    return Response.json(
      { data: null },
      { status: bannerShow.status, statusText: bannerShow.statusText }
    );
  }

  return Response.json({ data }, { status, statusText });
}
