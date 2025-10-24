import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function getAuthSession(req: Request) {
  try {
    const session = await getIronSession(req, new Response(), sessionOptions) as any;
    
    if (!session.auth || session.auth.status !== 'active' || !session.auth.id_uuid) {
      return null;
    }
    
    return {
      userId: session.auth.id_uuid,
      email: session.auth.email,
      provider: session.auth.provider
    };
  } catch (error) {
    console.error('Auth session error:', error);
    return null;
  }
}