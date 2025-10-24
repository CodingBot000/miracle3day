export interface AuthOnlyDto {
  id_uuid?: string | null;
  email?: string | null;
  provider: "google" | "apple" | "facebook";
  provider_user_id: string;
  avatar?: string | null;
  status: "pending" | "active";
}