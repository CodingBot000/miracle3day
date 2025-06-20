import { LOCATIONS as locationList } from "@/constants";
import { createClient } from "@/utils/supabase/server";
import { TABLE_HOSPITAL } from "@/constants/tables";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const location = locationList.map((loc) => {
    return loc.toLowerCase() === params.id.toLowerCase();
  });

  try {
    let query = supabase
      .from(TABLE_HOSPITAL)
      .select(`id_unique,name,location,latitude,longitude`);

    // 지역전체
    // if (params.id === "ALL" || location === -1) {
      if (params.id === "ALL") {
      const { data, error, status, statusText } = await query;

      if (error) {
        return Response.json({ data: null }, { status, statusText });
      }

      const position = data?.map(({ latitude, longitude, name }) => {
        return {
          lat: latitude,
          lng: longitude,
          title: name,
        };
      });

      return Response.json({ position }, { status, statusText });
    }

    const { data, error, status, statusText } = await query.match({ location });

    if (error) {
      return Response.json({ data: null }, { status, statusText });
    }

    const position = data?.map(({ latitude, longitude, name }) => {
      return {
        lat: latitude,
        lng: longitude,
        title: name,
      };
    });

    return Response.json({ position }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
