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
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_high_scores: {
        Row: {
          best_score: number
          best_time: number | null
          difficulty: Database["public"]["Enums"]["game_difficulty"]
          draws: number
          game_id: string
          games_played: number
          id: string
          losses: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          best_score?: number
          best_time?: number | null
          difficulty?: Database["public"]["Enums"]["game_difficulty"]
          draws?: number
          game_id: string
          games_played?: number
          id?: string
          losses?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          best_score?: number
          best_time?: number | null
          difficulty?: Database["public"]["Enums"]["game_difficulty"]
          draws?: number
          game_id?: string
          games_played?: number
          id?: string
          losses?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      game_rooms: {
        Row: {
          created_at: string
          current_turn: string | null
          game_id: string
          game_state: Json | null
          guest_id: string | null
          host_id: string
          id: string
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          current_turn?: string | null
          game_id: string
          game_state?: Json | null
          guest_id?: string | null
          host_id: string
          id?: string
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          current_turn?: string | null
          game_id?: string
          game_state?: Json | null
          guest_id?: string | null
          host_id?: string
          id?: string
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_rooms_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_rooms_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_scores: {
        Row: {
          accuracy: number | null
          combos: number | null
          created_at: string
          difficulty: Database["public"]["Enums"]["game_difficulty"]
          game_id: string
          id: string
          mode: Database["public"]["Enums"]["game_mode"]
          moves_count: number | null
          result: Database["public"]["Enums"]["game_result"] | null
          score: number
          time_taken: number | null
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          combos?: number | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["game_difficulty"]
          game_id: string
          id?: string
          mode?: Database["public"]["Enums"]["game_mode"]
          moves_count?: number | null
          result?: Database["public"]["Enums"]["game_result"] | null
          score?: number
          time_taken?: number | null
          user_id: string
        }
        Update: {
          accuracy?: number | null
          combos?: number | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["game_difficulty"]
          game_id?: string
          id?: string
          mode?: Database["public"]["Enums"]["game_mode"]
          moves_count?: number | null
          result?: Database["public"]["Enums"]["game_result"] | null
          score?: number
          time_taken?: number | null
          user_id?: string
        }
        Relationships: []
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
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          order_index: number
          subject_id: string
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          order_index?: number
          subject_id?: string
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string | null
          description: string
          icon: string | null
          id: string
          reward_gems: number
          reward_xp: number
          target_value: number
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          reward_gems?: number
          reward_xp?: number
          target_value: number
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          reward_gems?: number
          reward_xp?: number
          target_value?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      multiplayer_matches: {
        Row: {
          created_at: string
          game_id: string
          id: string
          moves_count: number | null
          player1_name: string
          player1_score: number | null
          player2_name: string
          player2_score: number | null
          time_taken: number | null
          user_id: string | null
          winner: string | null
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          moves_count?: number | null
          player1_name: string
          player1_score?: number | null
          player2_name: string
          player2_score?: number | null
          time_taken?: number | null
          user_id?: string | null
          winner?: string | null
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          moves_count?: number | null
          player1_name?: string
          player1_score?: number | null
          player2_name?: string
          player2_score?: number | null
          time_taken?: number | null
          user_id?: string | null
          winner?: string | null
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
      user_missions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          mission_id: string | null
          progress: number | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          mission_id?: string | null
          progress?: number | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          mission_id?: string | null
          progress?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
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
      user_settings: {
        Row: {
          auto_next_question: boolean | null
          created_at: string
          dark_mode: boolean | null
          difficulty: string | null
          game_timer: number | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          show_explanations: boolean | null
          sound_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_next_question?: boolean | null
          created_at?: string
          dark_mode?: boolean | null
          difficulty?: string | null
          game_timer?: number | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          show_explanations?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_next_question?: boolean | null
          created_at?: string
          dark_mode?: boolean | null
          difficulty?: string | null
          game_timer?: number | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          show_explanations?: boolean | null
          sound_enabled?: boolean | null
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
      are_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      assign_daily_missions: { Args: never; Returns: undefined }
      assign_weekly_missions: { Args: never; Returns: undefined }
      check_mission_completion: {
        Args: { p_mission_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      difficulty_level: "facil" | "medio" | "dificil" | "avancado"
      friendship_status: "pending" | "accepted" | "rejected" | "blocked"
      game_difficulty: "facil" | "medio" | "dificil"
      game_mode: "single" | "multiplayer"
      game_result: "vitoria" | "derrota" | "empate"
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
      friendship_status: ["pending", "accepted", "rejected", "blocked"],
      game_difficulty: ["facil", "medio", "dificil"],
      game_mode: ["single", "multiplayer"],
      game_result: ["vitoria", "derrota", "empate"],
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
