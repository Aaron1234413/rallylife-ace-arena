export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievement_progress: {
        Row: {
          achievement_id: string
          current_progress: number | null
          id: string
          last_updated: string
          player_id: string
        }
        Insert: {
          achievement_id: string
          current_progress?: number | null
          id?: string
          last_updated?: string
          player_id: string
        }
        Update: {
          achievement_id?: string
          current_progress?: number | null
          id?: string
          last_updated?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_hidden: boolean | null
          name: string
          requirement_data: Json | null
          requirement_type: string
          requirement_value: number | null
          reward_avatar_item_id: string | null
          reward_premium_tokens: number | null
          reward_tokens: number | null
          reward_xp: number | null
          tier: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          name: string
          requirement_data?: Json | null
          requirement_type: string
          requirement_value?: number | null
          reward_avatar_item_id?: string | null
          reward_premium_tokens?: number | null
          reward_tokens?: number | null
          reward_xp?: number | null
          tier?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          name?: string
          requirement_data?: Json | null
          requirement_type?: string
          requirement_value?: number | null
          reward_avatar_item_id?: string | null
          reward_premium_tokens?: number | null
          reward_tokens?: number | null
          reward_xp?: number | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_reward_avatar_item_id_fkey"
            columns: ["reward_avatar_item_id"]
            isOneToOne: false
            referencedRelation: "avatar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_default: boolean | null
          item_type: string
          name: string
          premium_cost: number | null
          rarity: string
          token_cost: number | null
          unlock_requirement: Json | null
          unlock_type: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_default?: boolean | null
          item_type: string
          name: string
          premium_cost?: number | null
          rarity?: string
          token_cost?: number | null
          unlock_requirement?: Json | null
          unlock_type: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_default?: boolean | null
          item_type?: string
          name?: string
          premium_cost?: number | null
          rarity?: string
          token_cost?: number | null
          unlock_requirement?: Json | null
          unlock_type?: string
        }
        Relationships: []
      }
      coach_profiles: {
        Row: {
          bio: string | null
          certifications: string[] | null
          coaching_focus: string | null
          created_at: string
          experience_years: number | null
          hourly_rate: number | null
          id: string
          location: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          coaching_focus?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id: string
          location?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          coaching_focus?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hp_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          hp_after: number
          hp_before: number
          hp_change: number
          id: string
          player_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          hp_after: number
          hp_before: number
          hp_change: number
          id?: string
          player_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          hp_after?: number
          hp_before?: number
          hp_change?: number
          id?: string
          player_id?: string
        }
        Relationships: []
      }
      player_achievements: {
        Row: {
          achievement_id: string
          claimed_at: string | null
          id: string
          is_claimed: boolean | null
          player_id: string
          progress_value: number | null
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          claimed_at?: string | null
          id?: string
          is_claimed?: boolean | null
          player_id: string
          progress_value?: number | null
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          claimed_at?: string | null
          id?: string
          is_claimed?: boolean | null
          player_id?: string
          progress_value?: number | null
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      player_avatar_equipped: {
        Row: {
          avatar_item_id: string
          category: string
          equipped_at: string
          id: string
          player_id: string
        }
        Insert: {
          avatar_item_id: string
          category: string
          equipped_at?: string
          id?: string
          player_id: string
        }
        Update: {
          avatar_item_id?: string
          category?: string
          equipped_at?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_avatar_equipped_avatar_item_id_fkey"
            columns: ["avatar_item_id"]
            isOneToOne: false
            referencedRelation: "avatar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      player_avatar_items: {
        Row: {
          avatar_item_id: string
          id: string
          player_id: string
          unlock_method: string
          unlocked_at: string
        }
        Insert: {
          avatar_item_id: string
          id?: string
          player_id: string
          unlock_method: string
          unlocked_at?: string
        }
        Update: {
          avatar_item_id?: string
          id?: string
          player_id?: string
          unlock_method?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_avatar_items_avatar_item_id_fkey"
            columns: ["avatar_item_id"]
            isOneToOne: false
            referencedRelation: "avatar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      player_hp: {
        Row: {
          created_at: string
          current_hp: number
          decay_paused: boolean
          decay_rate: number
          id: string
          last_activity: string
          max_hp: number
          player_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_hp?: number
          decay_paused?: boolean
          decay_rate?: number
          id?: string
          last_activity?: string
          max_hp?: number
          player_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_hp?: number
          decay_paused?: boolean
          decay_rate?: number
          id?: string
          last_activity?: string
          max_hp?: number
          player_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          location: string | null
          preferred_play_style: string | null
          skill_level: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          location?: string | null
          preferred_play_style?: string | null
          skill_level?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          location?: string | null
          preferred_play_style?: string | null
          skill_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      player_xp: {
        Row: {
          created_at: string
          current_level: number
          current_xp: number
          id: string
          player_id: string
          total_xp_earned: number
          updated_at: string
          xp_to_next_level: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_xp?: number
          id?: string
          player_id: string
          total_xp_earned?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          current_xp?: number
          id?: string
          player_id?: string
          total_xp_earned?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      token_balances: {
        Row: {
          created_at: string
          id: string
          lifetime_earned: number
          player_id: string
          premium_tokens: number
          regular_tokens: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_earned?: number
          player_id: string
          premium_tokens?: number
          regular_tokens?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_earned?: number
          player_id?: string
          premium_tokens?: number
          regular_tokens?: number
          updated_at?: string
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          player_id: string
          source: string
          token_type: string
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          player_id: string
          source: string
          token_type: string
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          player_id?: string
          source?: string
          token_type?: string
          transaction_type?: string
        }
        Relationships: []
      }
      xp_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          level_after: number
          level_before: number
          player_id: string
          xp_earned: number
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          level_after: number
          level_before: number
          player_id: string
          xp_earned: number
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          level_after?: number
          level_before?: number
          player_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_tokens: {
        Args: {
          user_id: string
          amount: number
          token_type?: string
          source?: string
          description?: string
        }
        Returns: Json
      }
      add_xp: {
        Args: {
          user_id: string
          xp_amount: number
          activity_type: string
          description?: string
        }
        Returns: Json
      }
      calculate_hp_decay: {
        Args: { user_id: string }
        Returns: number
      }
      calculate_level_from_xp: {
        Args: { total_xp: number }
        Returns: number
      }
      calculate_xp_for_level: {
        Args: { level: number }
        Returns: number
      }
      check_achievement_unlock: {
        Args: { user_id: string; achievement_id: string }
        Returns: Json
      }
      claim_achievement_reward: {
        Args: { user_id: string; achievement_id: string }
        Returns: Json
      }
      convert_premium_tokens: {
        Args: {
          user_id: string
          premium_amount: number
          conversion_rate?: number
        }
        Returns: Json
      }
      equip_avatar_item: {
        Args: { user_id: string; item_id: string }
        Returns: Json
      }
      initialize_default_achievements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      initialize_player_avatar: {
        Args: { user_id: string }
        Returns: undefined
      }
      initialize_player_hp: {
        Args: { user_id: string }
        Returns: undefined
      }
      initialize_player_tokens: {
        Args: { user_id: string }
        Returns: undefined
      }
      initialize_player_xp: {
        Args: { user_id: string }
        Returns: undefined
      }
      purchase_avatar_item: {
        Args: { user_id: string; item_id: string }
        Returns: Json
      }
      restore_hp: {
        Args: {
          user_id: string
          restoration_amount: number
          activity_type: string
          description?: string
        }
        Returns: number
      }
      spend_tokens: {
        Args: {
          user_id: string
          amount: number
          token_type?: string
          source?: string
          description?: string
        }
        Returns: Json
      }
      unlock_avatar_item: {
        Args: { user_id: string; item_id: string; unlock_method?: string }
        Returns: Json
      }
    }
    Enums: {
      user_role: "player" | "coach"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["player", "coach"],
    },
  },
} as const
