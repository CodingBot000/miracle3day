import { uploadActions } from "@/app/admin/upload/actions";

export async function POST(req: Request) {
  const formData = await req.formData();

  const result = await uploadActions(null, formData);
  return Response.json(result);
}
