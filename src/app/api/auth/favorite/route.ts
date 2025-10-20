import { createClient } from "@/utils/session/server";

import { LIMIT } from "./constant";
import { infinityParams } from "@/utils/inifinityQuery";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  const backendClient = createClient();

  try {
    const {
      data: { user },
    } = await backendClient.auth.getUser();

    const { limit, offset, nextCursor } = infinityParams({
      req,
      limits: LIMIT,
    });

    // 전체 리스트
    const { data, error, count, status, statusText } = await backendClient
      .from("favorite")
      .select(`*,hospital: id_hospital (name,imageurls,id_unique)`, {
        count: "exact",
      })
      .range(offset, limit)
      .match({ uuid: user?.id });

    if (error) {
      throw Error(error.code || error.message);
    }

    const res = {
      favorite: data,
      nextCursor: nextCursor(count),
    };

    return Response.json(res, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  const backendClient = createClient();
  const body = await req.json();

  try {
    const { id_hospital, uuid } = body;

    if (!uuid) throw Error("not Found User");

    const { data, error, statusText } = await backendClient
      .from("favorite")
      .select("*")
      .eq("uuid", uuid)
      .eq("id_hospital", id_hospital);

    if (error) {
      throw Error(statusText);
    }

    if (data?.length) {
      throw Error("already has favorite item");
    }

    const createFavorite = await backendClient
      .from("favorite")
      .insert([{ uuid, id_hospital }]);

    if (createFavorite.error) {
      throw Error(createFavorite.statusText);
    }

    return NextResponse.json(data, {
      status: createFavorite.status,
      statusText: createFavorite.statusText,
    });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}

export async function DELETE(req: NextRequest) {
  const backendClient = createClient();
  const body = await req.json();

  try {
    const { id_hospital, uuid } = body;

    const parseId = JSON.parse(id_hospital);

    if (!uuid) throw Error("not Found User");

    let query = backendClient.from("favorite").delete().eq("uuid", uuid);

    if (Array.isArray(parseId)) {
      query.in("id_hospital", parseId);
    } else {
      query.eq("id_hospital", parseId);
    }

    const { data, error, status, statusText } = await query.select("*");

    if (error) {
      return NextResponse.json(data, { status, statusText });
    }

    if (!data.length) {
      return NextResponse.json({ error: "No rows deleted" }, { status: 404 });
    }

    return NextResponse.json(data, {
      status,
      statusText,
    });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
