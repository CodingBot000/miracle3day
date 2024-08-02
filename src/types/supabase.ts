
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      banner_item: {
        Row: {
          created_at: string
          id: number
          id_unique: number
          imgurl: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          id_unique: number
          imgurl: string
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          id_unique?: number
          imgurl?: string
          name?: string
        }
        Relationships: []
      }
      banner_show: {
        Row: {
          created_at: string
          id: number
          id_banneritems: number[]
        }
        Insert: {
          created_at?: string
          id?: number
          id_banneritems: number[]
        }
        Update: {
          created_at?: string
          id?: number
          id_banneritems?: number[]
        }
        Relationships: []
      }
      event: {
        Row: {
          created_at: string
          date_from: string
          date_to: string
          description: string | null
          id: number
          id_hospital: number | null
          id_surgeries: number[] | null
          id_unique: number
          image_desc_urls: string[] | null
          imageurls: string[] | null
          name: string | null
        }
        Insert: {
          created_at?: string
          date_from: string
          date_to: string
          description?: string | null
          id?: number
          id_hospital?: number | null
          id_surgeries?: number[] | null
          id_unique: number
          image_desc_urls?: string[] | null
          imageurls?: string[] | null
          name?: string | null
        }
        Update: {
          created_at?: string
          date_from?: string
          date_to?: string
          description?: string | null
          id?: number
          id_hospital?: number | null
          id_surgeries?: number[] | null
          id_unique?: number
          image_desc_urls?: string[] | null
          imageurls?: string[] | null
          name?: string | null
        }
        Relationships: []
      }
      favorite: {
        Row: {
          created_at: string
          id: number
          id_hospital: number
          user_no: number
        }
        Insert: {
          created_at?: string
          id?: number
          id_hospital: number
          user_no: number
        }
        Update: {
          created_at?: string
          id?: number
          id_hospital?: number
          user_no?: number
        }
        Relationships: []
      }
      hospital: {
        Row: {
          created_at: string
          id: number
          id_surgeries: number[] | null
          id_unique: number
          imageurls: string[] | null
          latitude: number
          location: string | null
          longitude: number
          name: string
          searchkey: string
        }
        Insert: {
          created_at?: string
          id?: number
          id_surgeries?: number[] | null
          id_unique: number
          imageurls?: string[] | null
          latitude: number
          location?: string | null
          longitude: number
          name: string
          searchkey: string
        }
        Update: {
          created_at?: string
          id?: number
          id_surgeries?: number[] | null
          id_unique?: number
          imageurls?: string[] | null
          latitude?: number
          location?: string | null
          longitude?: number
          name?: string
          searchkey?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_id_unique_fkey"
            columns: ["id_unique"]
            isOneToOne: true
            referencedRelation: "hospital_details"
            referencedColumns: ["id_hospital"]
          },
        ]
      }
      hospital_details: {
        Row: {
          blog: string | null
          created_at: string
          desc_address: string | null
          desc_doctors_imgurls: string[] | null
          desc_facilities: string | null
          desc_openninghour: string | null
          etc: string | null
          facebook: string | null
          homepage: string | null
          id: number
          id_hospital: number
          instagram: string | null
          kakaotalk: string | null
          map: string | null
          snapchat: string | null
          tel: string | null
          ticktok: string | null
          youtube: string | null
        }
        Insert: {
          blog?: string | null
          created_at?: string
          desc_address?: string | null
          desc_doctors_imgurls?: string[] | null
          desc_facilities?: string | null
          desc_openninghour?: string | null
          etc?: string | null
          facebook?: string | null
          homepage?: string | null
          id?: number
          id_hospital: number
          instagram?: string | null
          kakaotalk?: string | null
          map?: string | null
          snapchat?: string | null
          tel?: string | null
          ticktok?: string | null
          youtube?: string | null
        }
        Update: {
          blog?: string | null
          created_at?: string
          desc_address?: string | null
          desc_doctors_imgurls?: string[] | null
          desc_facilities?: string | null
          desc_openninghour?: string | null
          etc?: string | null
          facebook?: string | null
          homepage?: string | null
          id?: number
          id_hospital?: number
          instagram?: string | null
          kakaotalk?: string | null
          map?: string | null
          snapchat?: string | null
          tel?: string | null
          ticktok?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          description: string | null
          id: number
          id_event: number | null
          id_hospital: number | null
          id_surgeries: number[] | null
          id_unique: number
          reviewimageurls: string[] | null
          user_no: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          id_event?: number | null
          id_hospital?: number | null
          id_surgeries?: number[] | null
          id_unique: number
          reviewimageurls?: string[] | null
          user_no?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          id_event?: number | null
          id_hospital?: number | null
          id_surgeries?: number[] | null
          id_unique?: number
          reviewimageurls?: string[] | null
          user_no?: number | null
        }
        Relationships: []
      }
      surgery_info: {
        Row: {
          created_at: string
          description: string | null
          id: number
          id_unique: number
          imageurls: string[] | null
          name: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          id_unique: number
          imageurls?: string[] | null
          name?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          id_unique?: number
          imageurls?: string[] | null
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string
          email: string
          email_confirmed_at: boolean | null
          hash: string
          id: string
          name: string
          nickname: string
          refesh_token: string | null
          updated_at: string
          user_no: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_confirmed_at?: boolean | null
          hash: string
          id?: string
          name: string
          nickname: string
          refesh_token?: string | null
          updated_at?: string
          user_no?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_confirmed_at?: boolean | null
          hash?: string
          id?: string
          name?: string
          nickname?: string
          refesh_token?: string | null
          updated_at?: string
          user_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
