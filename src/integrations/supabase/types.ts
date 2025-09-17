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
      cars: {
        Row: {
          brand: string
          created_at: string
          id: string
          is_available: boolean
          license_plate: string
          model: string
          updated_at: string
          year: number | null
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          is_available?: boolean
          license_plate: string
          model: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          is_available?: boolean
          license_plate?: string
          model?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      instructor_availability: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          instructor_id: string
          is_available: boolean
          reason: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          instructor_id: string
          is_available?: boolean
          reason?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          instructor_id?: string
          is_available?: boolean
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_availability_instructor"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          available_hours: Json | null
          created_at: string
          id: string
          max_lessons_per_day: number | null
          profile_id: string
          specializations: string[] | null
          updated_at: string
        }
        Insert: {
          available_hours?: Json | null
          created_at?: string
          id?: string
          max_lessons_per_day?: number | null
          profile_id: string
          specializations?: string[] | null
          updated_at?: string
        }
        Update: {
          available_hours?: Json | null
          created_at?: string
          id?: string
          max_lessons_per_day?: number | null
          profile_id?: string
          specializations?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_feedback: {
        Row: {
          comments: string | null
          created_at: string
          driving_skills: number | null
          id: string
          instructor_id: string
          lesson_id: string
          overall_progress: number | null
          parking_skills: number | null
          recommendations: string | null
          traffic_awareness: number | null
        }
        Insert: {
          comments?: string | null
          created_at?: string
          driving_skills?: number | null
          id?: string
          instructor_id: string
          lesson_id: string
          overall_progress?: number | null
          parking_skills?: number | null
          recommendations?: string | null
          traffic_awareness?: number | null
        }
        Update: {
          comments?: string | null
          created_at?: string
          driving_skills?: number | null
          id?: string
          instructor_id?: string
          lesson_id?: string
          overall_progress?: number | null
          parking_skills?: number | null
          recommendations?: string | null
          traffic_awareness?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_feedback_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_feedback_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          lessons_count: number
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          lessons_count: number
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          lessons_count?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      lesson_requests: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          instructor_id: string
          instructor_notes: string | null
          location: string | null
          notes: string | null
          requested_date: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id: string
          instructor_notes?: string | null
          location?: string | null
          notes?: string | null
          requested_date: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id?: string
          instructor_notes?: string | null
          location?: string | null
          notes?: string | null
          requested_date?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lesson_requests_instructor"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lesson_requests_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          instructor_id: string
          location: string | null
          notes: string | null
          scheduled_at: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          instructor_id: string
          location?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          instructor_id?: string
          location?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_proofs: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          id: string
          invoice_email: string | null
          invoice_sent_at: string | null
          lesson_package_id: string
          lessons_added: boolean | null
          payment_received_at: string | null
          processed_at: string | null
          processed_by: string | null
          proof_email: string
          rejection_reason: string | null
          status: string
          student_id: string
          submitted_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          id?: string
          invoice_email?: string | null
          invoice_sent_at?: string | null
          lesson_package_id: string
          lessons_added?: boolean | null
          payment_received_at?: string | null
          processed_at?: string | null
          processed_by?: string | null
          proof_email: string
          rejection_reason?: string | null
          status?: string
          student_id: string
          submitted_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          id?: string
          invoice_email?: string | null
          invoice_sent_at?: string | null
          lesson_package_id?: string
          lessons_added?: boolean | null
          payment_received_at?: string | null
          processed_at?: string | null
          processed_by?: string | null
          proof_email?: string
          rejection_reason?: string | null
          status?: string
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment_proofs_admin"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment_proofs_package"
            columns: ["lesson_package_id"]
            isOneToOne: false
            referencedRelation: "lesson_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment_proofs_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          id: string
          lessons_remaining: number | null
          license_type: string | null
          profile_id: string
          theory_exam_passed: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lessons_remaining?: number | null
          license_type?: string | null
          profile_id: string
          theory_exam_passed?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lessons_remaining?: number | null
          license_type?: string | null
          profile_id?: string
          theory_exam_passed?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_payment_proof: {
        Args: {
          admin_user_id: string
          invoice_email?: string
          payment_proof_id: string
        }
        Returns: undefined
      }
      approve_payment_and_add_lessons: {
        Args: { admin_user_id: string; payment_proof_id: string }
        Returns: undefined
      }
      ensure_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_instructor_available: {
        Args: {
          _date: string
          _end: string
          _instructor_id: string
          _start: string
        }
        Returns: boolean
      }
      mark_invoice_sent: {
        Args: { admin_user_id: string; payment_proof_id: string }
        Returns: undefined
      }
      mark_payment_received: {
        Args: { admin_user_id: string; payment_proof_id: string }
        Returns: undefined
      }
      reject_payment: {
        Args: {
          admin_user_id: string
          payment_proof_id: string
          reason?: string
        }
        Returns: undefined
      }
      update_payment_status: {
        Args: {
          admin_user_id: string
          new_status: string
          notes?: string
          payment_proof_id: string
        }
        Returns: undefined
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
    Enums: {},
  },
} as const
