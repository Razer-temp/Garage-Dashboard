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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bikes: {
        Row: {
          chassis_number: string | null
          color: string | null
          created_at: string
          customer_id: string
          engine_number: string | null
          id: string
          last_mileage: number | null
          make_model: string
          registration_number: string
          updated_at: string
          year: number | null
        }
        Insert: {
          chassis_number?: string | null
          color?: string | null
          created_at?: string
          customer_id: string
          engine_number?: string | null
          id?: string
          last_mileage?: number | null
          make_model: string
          registration_number: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          chassis_number?: string | null
          color?: string | null
          created_at?: string
          customer_id?: string
          engine_number?: string | null
          id?: string
          last_mileage?: number | null
          make_model?: string
          registration_number?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bikes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          job_id: string | null
          message_content: string
          sent_via: string
          status: string | null
          template_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          job_id?: string | null
          message_content: string
          sent_via: string
          status?: string | null
          template_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          job_id?: string | null
          message_content?: string
          sent_via?: string
          status?: string | null
          template_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_built_in: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_built_in?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_built_in?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      garage_settings: {
        Row: {
          address: string
          created_at: string
          email: string
          gstin: string | null
          id: string
          name: string
          phone: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string
          created_at?: string
          email?: string
          gstin?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          gstin?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          code: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          min_stock_level: number | null
          name: string
          selling_price: number | null
          stock_quantity: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name: string
          selling_price?: number | null
          stock_quantity?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name?: string
          selling_price?: number | null
          stock_quantity?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_parts: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string | null
          item_name: string
          job_id: string
          quantity: number | null
          total_price: number | null
          unit_price: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          item_name: string
          job_id: string
          quantity?: number | null
          total_price?: never
          unit_price?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          item_name?: string
          job_id?: string
          quantity?: number | null
          total_price?: never
          unit_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_parts_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_parts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          bike_id: string
          created_at: string
          date_in: string
          date_out: string | null
          estimated_cost: number | null
          final_total: number | null
          discount_amount: number | null
          gst_amount: number | null
          gst_percent: number | null
          id: string
          invoice_number: string | null
          is_invoice_generated: boolean | null
          labor_cost: number | null
          mechanic_notes: string | null
          next_service_date: string | null
          next_service_mileage: number | null
          parts_used: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          problem_description: string
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          user_id: string
          applied_package_id: string | null
          applied_package_name: string | null
          paid_amount: number | null
        }
        Insert: {
          bike_id: string
          created_at?: string
          date_in?: string
          date_out?: string | null
          discount_amount?: number | null
          estimated_cost?: number | null
          final_total?: number | null
          gst_amount?: number | null
          gst_percent?: number | null
          id?: string
          invoice_number?: string | null
          is_invoice_generated?: boolean | null
          labor_cost?: number | null
          mechanic_notes?: string | null
          next_service_date?: string | null
          next_service_mileage?: number | null
          parts_used?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          problem_description: string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id: string
          applied_package_id?: string | null
          applied_package_name?: string | null
          paid_amount?: number | null
        }
        Update: {
          bike_id?: string
          created_at?: string
          date_in?: string
          date_out?: string | null
          discount_amount?: number | null
          estimated_cost?: number | null
          final_total?: number | null
          gst_amount?: number | null
          gst_percent?: number | null
          id?: string
          invoice_number?: string | null
          is_invoice_generated?: boolean | null
          labor_cost?: number | null
          mechanic_notes?: string | null
          next_service_date?: string | null
          next_service_mileage?: number | null
          parts_used?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          problem_description?: string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id?: string
          applied_package_id?: string | null
          applied_package_name?: string | null
          paid_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_applied_package_id_fkey"
            columns: ["applied_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
      service_package_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string | null
          item_name: string
          package_id: string
          quantity: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          item_name: string
          package_id: string
          quantity?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          item_name?: string
          package_id?: string
          quantity?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_package_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          category: string | null
          checklist_items: Json | null
          created_at: string
          description: string | null
          estimated_time: string | null
          fixed_price: number | null
          gst_applicable: boolean | null
          id: string
          labor_charge: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          checklist_items?: Json | null
          created_at?: string
          description?: string | null
          estimated_time?: string | null
          fixed_price?: number | null
          gst_applicable?: boolean | null
          id?: string
          labor_charge?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          checklist_items?: Json | null
          created_at?: string
          description?: string | null
          estimated_time?: string | null
          fixed_price?: number | null
          gst_applicable?: boolean | null
          id?: string
          labor_charge?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      job_status: "pending" | "in_progress" | "ready_for_delivery" | "delivered"
      payment_status: "pending" | "partial" | "paid"
      payment_method: "cash" | "upi" | "credit_card" | "debit_card" | "bank_transfer"
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
      job_status: ["pending", "in_progress", "ready_for_delivery", "delivered"],
      payment_status: ["pending", "partial", "paid"],
      payment_method: ["cash", "upi", "credit_card", "debit_card", "bank_transfer"],
    },
  },
} as const
