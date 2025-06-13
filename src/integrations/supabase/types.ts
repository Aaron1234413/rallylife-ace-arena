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
      activity_logs: {
        Row: {
          activity_category: string
          activity_type: string
          coach_name: string | null
          court_surface: string | null
          created_at: string
          description: string | null
          difficulty_rating: number | null
          duration_minutes: number | null
          energy_after: number | null
          energy_before: number | null
          enjoyment_rating: number | null
          equipment_used: string[] | null
          hp_impact: number | null
          id: string
          intensity_level: string | null
          is_competitive: boolean | null
          is_official: boolean | null
          location: string | null
          logged_at: string
          metadata: Json | null
          notes: string | null
          opponent_name: string | null
          player_id: string
          result: string | null
          score: string | null
          skills_practiced: string[] | null
          tags: string[] | null
          title: string
          updated_at: string
          weather_conditions: string | null
          xp_earned: number | null
        }
        Insert: {
          activity_category: string
          activity_type: string
          coach_name?: string | null
          court_surface?: string | null
          created_at?: string
          description?: string | null
          difficulty_rating?: number | null
          duration_minutes?: number | null
          energy_after?: number | null
          energy_before?: number | null
          enjoyment_rating?: number | null
          equipment_used?: string[] | null
          hp_impact?: number | null
          id?: string
          intensity_level?: string | null
          is_competitive?: boolean | null
          is_official?: boolean | null
          location?: string | null
          logged_at?: string
          metadata?: Json | null
          notes?: string | null
          opponent_name?: string | null
          player_id: string
          result?: string | null
          score?: string | null
          skills_practiced?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          weather_conditions?: string | null
          xp_earned?: number | null
        }
        Update: {
          activity_category?: string
          activity_type?: string
          coach_name?: string | null
          court_surface?: string | null
          created_at?: string
          description?: string | null
          difficulty_rating?: number | null
          duration_minutes?: number | null
          energy_after?: number | null
          energy_before?: number | null
          enjoyment_rating?: number | null
          equipment_used?: string[] | null
          hp_impact?: number | null
          id?: string
          intensity_level?: string | null
          is_competitive?: boolean | null
          is_official?: boolean | null
          location?: string | null
          logged_at?: string
          metadata?: Json | null
          notes?: string | null
          opponent_name?: string | null
          player_id?: string
          result?: string | null
          score?: string | null
          skills_practiced?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          weather_conditions?: string | null
          xp_earned?: number | null
        }
        Relationships: []
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
      challenges: {
        Row: {
          accepted_at: string | null
          challenge_type: string
          challenged_id: string
          challenger_id: string
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          stakes_premium_tokens: number | null
          stakes_tokens: number | null
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          challenge_type: string
          challenged_id: string
          challenger_id: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          stakes_premium_tokens?: number | null
          stakes_tokens?: number | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          challenge_type?: string
          challenged_id?: string
          challenger_id?: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          stakes_premium_tokens?: number | null
          stakes_tokens?: number | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_avatar_equipped: {
        Row: {
          avatar_item_id: string
          category: string
          coach_id: string
          equipped_at: string
          id: string
        }
        Insert: {
          avatar_item_id: string
          category: string
          coach_id: string
          equipped_at?: string
          id?: string
        }
        Update: {
          avatar_item_id?: string
          category?: string
          coach_id?: string
          equipped_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_avatar_equipped_avatar_item_id_fkey"
            columns: ["avatar_item_id"]
            isOneToOne: false
            referencedRelation: "coach_avatar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_avatar_items: {
        Row: {
          category: string
          created_at: string
          ctk_cost: number | null
          description: string | null
          id: string
          image_url: string
          is_default: boolean | null
          is_professional: boolean | null
          item_type: string
          name: string
          rarity: string
          unlock_requirement: Json | null
          unlock_type: string
        }
        Insert: {
          category: string
          created_at?: string
          ctk_cost?: number | null
          description?: string | null
          id?: string
          image_url: string
          is_default?: boolean | null
          is_professional?: boolean | null
          item_type: string
          name: string
          rarity?: string
          unlock_requirement?: Json | null
          unlock_type: string
        }
        Update: {
          category?: string
          created_at?: string
          ctk_cost?: number | null
          description?: string | null
          id?: string
          image_url?: string
          is_default?: boolean | null
          is_professional?: boolean | null
          item_type?: string
          name?: string
          rarity?: string
          unlock_requirement?: Json | null
          unlock_type?: string
        }
        Relationships: []
      }
      coach_avatar_owned: {
        Row: {
          avatar_item_id: string
          coach_id: string
          id: string
          unlock_method: string
          unlocked_at: string
        }
        Insert: {
          avatar_item_id: string
          coach_id: string
          id?: string
          unlock_method: string
          unlocked_at?: string
        }
        Update: {
          avatar_item_id?: string
          coach_id?: string
          id?: string
          unlock_method?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_avatar_owned_avatar_item_id_fkey"
            columns: ["avatar_item_id"]
            isOneToOne: false
            referencedRelation: "coach_avatar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_crp: {
        Row: {
          booking_rate_bonus: number
          coach_id: string
          created_at: string
          current_crp: number
          id: string
          reputation_level: string
          total_crp_earned: number
          updated_at: string
          visibility_score: number
        }
        Insert: {
          booking_rate_bonus?: number
          coach_id: string
          created_at?: string
          current_crp?: number
          id?: string
          reputation_level?: string
          total_crp_earned?: number
          updated_at?: string
          visibility_score?: number
        }
        Update: {
          booking_rate_bonus?: number
          coach_id?: string
          created_at?: string
          current_crp?: number
          id?: string
          reputation_level?: string
          total_crp_earned?: number
          updated_at?: string
          visibility_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "coach_crp_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_cxp: {
        Row: {
          certifications_unlocked: string[] | null
          coach_id: string
          coaching_tier: string
          commission_rate: number
          created_at: string
          current_cxp: number
          current_level: number
          cxp_to_next_level: number
          id: string
          tools_unlocked: string[] | null
          total_cxp_earned: number
          updated_at: string
        }
        Insert: {
          certifications_unlocked?: string[] | null
          coach_id: string
          coaching_tier?: string
          commission_rate?: number
          created_at?: string
          current_cxp?: number
          current_level?: number
          cxp_to_next_level?: number
          id?: string
          tools_unlocked?: string[] | null
          total_cxp_earned?: number
          updated_at?: string
        }
        Update: {
          certifications_unlocked?: string[] | null
          coach_id?: string
          coaching_tier?: string
          commission_rate?: number
          created_at?: string
          current_cxp?: number
          current_level?: number
          cxp_to_next_level?: number
          id?: string
          tools_unlocked?: string[] | null
          total_cxp_earned?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_cxp_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      coach_token_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          coach_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          source: string
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source: string
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          transaction_type?: string
        }
        Relationships: []
      }
      coach_tokens: {
        Row: {
          coach_id: string
          created_at: string
          current_tokens: number
          id: string
          lifetime_earned: number
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          current_tokens?: number
          id?: string
          lifetime_earned?: number
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          current_tokens?: number
          id?: string
          lifetime_earned?: number
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crp_activities: {
        Row: {
          activity_type: string
          coach_id: string
          created_at: string
          crp_after: number
          crp_before: number
          crp_change: number
          description: string | null
          id: string
          metadata: Json | null
          source_player_id: string | null
        }
        Insert: {
          activity_type: string
          coach_id: string
          created_at?: string
          crp_after: number
          crp_before: number
          crp_change: number
          description?: string | null
          id?: string
          metadata?: Json | null
          source_player_id?: string | null
        }
        Update: {
          activity_type?: string
          coach_id?: string
          created_at?: string
          crp_after?: number
          crp_before?: number
          crp_change?: number
          description?: string | null
          id?: string
          metadata?: Json | null
          source_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crp_activities_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crp_activities_source_player_id_fkey"
            columns: ["source_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cxp_activities: {
        Row: {
          activity_type: string
          coach_id: string
          created_at: string
          cxp_earned: number
          description: string | null
          id: string
          metadata: Json | null
          source_player_id: string | null
        }
        Insert: {
          activity_type: string
          coach_id: string
          created_at?: string
          cxp_earned: number
          description?: string | null
          id?: string
          metadata?: Json | null
          source_player_id?: string | null
        }
        Update: {
          activity_type?: string
          coach_id?: string
          created_at?: string
          cxp_earned?: number
          description?: string | null
          id?: string
          metadata?: Json | null
          source_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxp_activities_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxp_activities_source_player_id_fkey"
            columns: ["source_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      player_feedback: {
        Row: {
          coach_id: string
          created_at: string
          crp_awarded: number
          feedback_text: string | null
          id: string
          player_id: string
          rating: number
          session_date: string
          session_type: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          crp_awarded?: number
          feedback_text?: string | null
          id?: string
          player_id: string
          rating: number
          session_date: string
          session_type: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          crp_awarded?: number
          feedback_text?: string | null
          id?: string
          player_id?: string
          rating?: number
          session_date?: string
          session_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_feedback_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_feedback_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          ready_player_me_url: string | null
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
          ready_player_me_url?: string | null
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
          ready_player_me_url?: string | null
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
      add_coach_tokens: {
        Args: {
          user_id: string
          amount: number
          source?: string
          description?: string
        }
        Returns: Json
      }
      add_crp: {
        Args: {
          user_id: string
          crp_amount: number
          activity_type: string
          description?: string
          source_player_id?: string
          metadata?: Json
        }
        Returns: Json
      }
      add_cxp: {
        Args: {
          user_id: string
          cxp_amount: number
          activity_type: string
          description?: string
          source_player_id?: string
          metadata?: Json
        }
        Returns: Json
      }
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
      calculate_cxp_for_level: {
        Args: { level: number }
        Returns: number
      }
      calculate_hp_decay: {
        Args: { user_id: string }
        Returns: number
      }
      calculate_level_from_cxp: {
        Args: { total_cxp: number }
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
      create_direct_conversation: {
        Args: { other_user_id: string; conversation_name?: string }
        Returns: string
      }
      equip_avatar_item: {
        Args: { user_id: string; item_id: string }
        Returns: Json
      }
      equip_coach_avatar_item: {
        Args: { user_id: string; item_id: string }
        Returns: Json
      }
      get_activity_feed: {
        Args: {
          user_id: string
          limit_count?: number
          offset_count?: number
          activity_type_filter?: string
          date_from?: string
          date_to?: string
        }
        Returns: {
          id: string
          activity_type: string
          activity_category: string
          title: string
          description: string
          duration_minutes: number
          intensity_level: string
          location: string
          opponent_name: string
          coach_name: string
          score: string
          result: string
          hp_impact: number
          xp_earned: number
          enjoyment_rating: number
          is_competitive: boolean
          logged_at: string
          created_at: string
        }[]
      }
      get_activity_stats: {
        Args: { user_id: string; days_back?: number }
        Returns: Json
      }
      initialize_coach_avatar: {
        Args: { user_id: string }
        Returns: undefined
      }
      initialize_coach_crp: {
        Args: { user_id: string }
        Returns: undefined
      }
      initialize_coach_cxp: {
        Args: { user_id: string }
        Returns: undefined
      }
      initialize_coach_tokens: {
        Args: { user_id: string }
        Returns: undefined
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
      log_comprehensive_activity: {
        Args: {
          user_id: string
          activity_type: string
          activity_category: string
          title: string
          description?: string
          duration_minutes?: number
          intensity_level?: string
          location?: string
          opponent_name?: string
          coach_name?: string
          score?: string
          result?: string
          notes?: string
          weather_conditions?: string
          court_surface?: string
          equipment_used?: string[]
          skills_practiced?: string[]
          energy_before?: number
          energy_after?: number
          enjoyment_rating?: number
          difficulty_rating?: number
          tags?: string[]
          is_competitive?: boolean
          is_official?: boolean
          logged_at?: string
          metadata?: Json
        }
        Returns: Json
      }
      purchase_avatar_item: {
        Args: { user_id: string; item_id: string }
        Returns: Json
      }
      purchase_coach_avatar_item: {
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
      send_challenge: {
        Args: {
          challenged_user_id: string
          challenge_type: string
          stakes_tokens?: number
          stakes_premium_tokens?: number
          message?: string
          metadata?: Json
        }
        Returns: string
      }
      send_message: {
        Args: {
          conversation_id: string
          content: string
          message_type?: string
          metadata?: Json
        }
        Returns: string
      }
      spend_coach_tokens: {
        Args: {
          user_id: string
          amount: number
          source?: string
          description?: string
        }
        Returns: Json
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
      submit_player_feedback: {
        Args: {
          coach_user_id: string
          rating: number
          feedback_text?: string
          session_type?: string
          session_date?: string
        }
        Returns: Json
      }
      unlock_avatar_item: {
        Args: { user_id: string; item_id: string; unlock_method?: string }
        Returns: Json
      }
      unlock_coach_avatar_item: {
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
