export interface HospitalAccess {
  hospital_id: string;
  hospital_name?: string;
}

export interface AuthOnlyDto {
  id_uuid?: string | null;
  email?: string | null;
  provider: "google" | "apple" | "facebook";
  provider_user_id: string;
  avatar?: string | null;
  name?: string | null;
  status: "pending" | "active";
  role?: "user" | "hospital_admin" | "super_admin";
  hospitalAccess?: HospitalAccess[];
}