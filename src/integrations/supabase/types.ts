export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      extension_requests: {
        Row: {
          created_at: string
          gatepass_id: string
          id: string
          new_expected_return_at: string
          reason: string
          status: string
          superintendent_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gatepass_id: string
          id?: string
          new_expected_return_at: string
          reason: string
          status?: string
          superintendent_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gatepass_id?: string
          id?: string
          new_expected_return_at?: string
          reason?: string
          status?: string
          superintendent_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extension_requests_gatepass_id_fkey"
            columns: ["gatepass_id"]
            isOneToOne: false
            referencedRelation: "gatepasses"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_logs: {
        Row: {
          action: string
          gatepass_id: string
          id: string
          notes: string | null
          security_guard_id: string
          timestamp: string
        }
        Insert: {
          action: string
          gatepass_id: string
          id?: string
          notes?: string | null
          security_guard_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          gatepass_id?: string
          id?: string
          notes?: string | null
          security_guard_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_logs_gatepass_id_fkey"
            columns: ["gatepass_id"]
            isOneToOne: false
            referencedRelation: "gatepasses"
            referencedColumns: ["id"]
          },
        ]
      }
      gatepasses: {
        Row: {
          attendant_id: string | null
          attendant_notes: string | null
          created_at: string
          destination_details: string
          destination_type: Database["public"]["Enums"]["destination_type"]
          expected_return_at: string
          id: string
          parent_confirmed: boolean | null
          qr_code_data: string | null
          reason: string
          status: Database["public"]["Enums"]["pass_status"]
          student_id: string
          superintendent_id: string | null
          superintendent_notes: string | null
          updated_at: string
        }
        Insert: {
          attendant_id?: string | null
          attendant_notes?: string | null
          created_at?: string
          destination_details: string
          destination_type: Database["public"]["Enums"]["destination_type"]
          expected_return_at: string
          id?: string
          parent_confirmed?: boolean | null
          qr_code_data?: string | null
          reason: string
          status?: Database["public"]["Enums"]["pass_status"]
          student_id: string
          superintendent_id?: string | null
          superintendent_notes?: string | null
          updated_at?: string
        }
        Update: {
          attendant_id?: string | null
          attendant_notes?: string | null
          created_at?: string
          destination_details?: string
          destination_type?: Database["public"]["Enums"]["destination_type"]
          expected_return_at?: string
          id?: string
          parent_confirmed?: boolean | null
          qr_code_data?: string | null
          reason?: string
          status?: Database["public"]["Enums"]["pass_status"]
          student_id?: string
          superintendent_id?: string | null
          superintendent_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          college_email: string | null
          created_at: string
          full_name: string
          hostel: string | null
          id: string
          parent_contact: string | null
          roll_no: string | null
          updated_at: string
        }
        Insert: {
          college_email?: string | null
          created_at?: string
          full_name: string
          hostel?: string | null
          id: string
          parent_contact?: string | null
          roll_no?: string | null
          updated_at?: string
        }
        Update: {
          college_email?: string | null
          created_at?: string
          full_name?: string
          hostel?: string | null
          id?: string
          parent_contact?: string | null
          roll_no?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_hostel: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "student"
        | "hostel_attendant"
        | "superintendent"
        | "security_guard"
      destination_type: "chandaka" | "bhubaneswar" | "home_other"
      pass_status:
        | "pending"
        | "attendant_approved"
        | "superintendent_approved"
        | "rejected"
        | "exited"
        | "entered"
        | "overdue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "student",
        "hostel_attendant",
        "superintendent",
        "security_guard",
      ],
      destination_type: ["chandaka", "bhubaneswar", "home_other"],
      pass_status: [
        "pending",
        "attendant_approved",
        "superintendent_approved",
        "rejected",
        "exited",
        "entered",
        "overdue",
      ],
    },
  },
} as const
