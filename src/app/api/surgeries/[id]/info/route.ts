import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: number } }
) {
  const supabase = createClient();

  const id = params.id;

  try {
    const { data, error, status, statusText, count } = await supabase
    .from("surgery_info")
    .select()
    .match({ id_unique: id })
    .single();

 
    if (status !== 200 || error) {

      return Response.json({
        status,
        statusText,
      });
    }
  
    return Response.json({ data }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
