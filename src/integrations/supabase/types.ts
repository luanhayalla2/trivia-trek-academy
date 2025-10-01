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
      achievements: {
        Row: {
          achievement_type: string
          description: string | null
          earned_at: string | null
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          order_index: number
          subject_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          order_index: number
          subject_id: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          order_index?: number
          subject_id?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accuracy: number | null
          active_ship: Database["public"]["Enums"]["ship_type"] | null
          avatar_url: string | null
          best_streak: number | null
          coins: number | null
          created_at: string | null
          current_streak: number | null
          gems: number | null
          global_rank: number | null
          id: string
          level: number | null
          questions_answered: number | null
          total_xp: number | null
          updated_at: string | null
          username: string
          xp: number | null
        }
        Insert: {
          accuracy?: number | null
          active_ship?: Database["public"]["Enums"]["ship_type"] | null
          avatar_url?: string | null
          best_streak?: number | null
          coins?: number | null
          created_at?: string | null
          current_streak?: number | null
          gems?: number | null
          global_rank?: number | null
          id: string
          level?: number | null
          questions_answered?: number | null
          total_xp?: number | null
          updated_at?: string | null
          username: string
          xp?: number | null
        }
        Update: {
          accuracy?: number | null
          active_ship?: Database["public"]["Enums"]["ship_type"] | null
          avatar_url?: string | null
          best_streak?: number | null
          coins?: number | null
          created_at?: string | null
          current_streak?: number | null
          gems?: number | null
          global_rank?: number | null
          id?: string
          level?: number | null
          questions_answered?: number | null
          total_xp?: number | null
          updated_at?: string | null
          username?: string
          xp?: number | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string
          id: string
          lesson_id: string | null
          options: Json
          question_text: string
          time_limit: number | null
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string
          id?: string
          lesson_id?: string | null
          options: Json
          question_text: string
          time_limit?: number | null
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string
          id?: string
          lesson_id?: string | null
          options?: Json
          question_text?: string
          time_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      ships: {
        Row: {
          id: string
          purchased_at: string | null
          ship_type: Database["public"]["Enums"]["ship_type"]
          user_id: string | null
        }
        Insert: {
          id?: string
          purchased_at?: string | null
          ship_type: Database["public"]["Enums"]["ship_type"]
          user_id?: string | null
        }
        Update: {
          id?: string
          purchased_at?: string | null
          ship_type?: Database["public"]["Enums"]["ship_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string | null
          score: number | null
          time_taken: number | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          score?: number | null
          time_taken?: number | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          score?: number | null
          time_taken?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
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
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "facil" | "medio" | "dificil" | "avancado"
      ship_type:
        | "explorador"
        | "velocista"
        | "erudito"
        | "guerreiro"
        | "mistico"
        | "cosmico"
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
      difficulty_level: ["facil", "medio", "dificil", "avancado"],
      ship_type: [
        "explorador",
        "velocista",
        "erudito",
        "guerreiro",
        "mistico",
        "cosmico",
      ],
    },
  },
} as const
