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
      academy_progress: {
        Row: {
          created_at: string
          daily_streak: number
          daily_tokens_earned: number
          id: string
          is_onboarding_completed: boolean
          last_activity: string
          level: number
          level_name: string
          placement_quiz_completed: boolean
          player_id: string
          quizzes_completed: number
          total_xp: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_streak?: number
          daily_tokens_earned?: number
          id?: string
          is_onboarding_completed?: boolean
          last_activity?: string
          level?: number
          level_name?: string
          placement_quiz_completed?: boolean
          player_id: string
          quizzes_completed?: number
          total_xp?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_streak?: number
          daily_tokens_earned?: number
          id?: string
          is_onboarding_completed?: boolean
          last_activity?: string
          level?: number
          level_name?: string
          placement_quiz_completed?: boolean
          player_id?: string
          quizzes_completed?: number
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
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
      active_match_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_set: number
          end_mood: string | null
          final_score: string | null
          id: string
          is_doubles: boolean | null
          match_notes: string | null
          match_type: string
          mid_match_mood: string | null
          mid_match_notes: string | null
          opponent_1_id: string | null
          opponent_1_name: string | null
          opponent_2_id: string | null
          opponent_2_name: string | null
          opponent_id: string | null
          opponent_name: string
          partner_id: string | null
          partner_name: string | null
          pause_start_time: string | null
          player_id: string
          result: string | null
          sets: Json
          start_time: string
          status: string
          total_paused_duration: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_set?: number
          end_mood?: string | null
          final_score?: string | null
          id?: string
          is_doubles?: boolean | null
          match_notes?: string | null
          match_type: string
          mid_match_mood?: string | null
          mid_match_notes?: string | null
          opponent_1_id?: string | null
          opponent_1_name?: string | null
          opponent_2_id?: string | null
          opponent_2_name?: string | null
          opponent_id?: string | null
          opponent_name: string
          partner_id?: string | null
          partner_name?: string | null
          pause_start_time?: string | null
          player_id: string
          result?: string | null
          sets?: Json
          start_time: string
          status?: string
          total_paused_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_set?: number
          end_mood?: string | null
          final_score?: string | null
          id?: string
          is_doubles?: boolean | null
          match_notes?: string | null
          match_type?: string
          mid_match_mood?: string | null
          mid_match_notes?: string | null
          opponent_1_id?: string | null
          opponent_1_name?: string | null
          opponent_2_id?: string | null
          opponent_2_name?: string | null
          opponent_id?: string | null
          opponent_name?: string
          partner_id?: string | null
          partner_name?: string | null
          pause_start_time?: string | null
          player_id?: string
          result?: string | null
          sets?: Json
          start_time?: string
          status?: string
          total_paused_duration?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_match_sessions_opponent_1_id_fkey"
            columns: ["opponent_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_match_sessions_opponent_2_id_fkey"
            columns: ["opponent_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_match_sessions_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_match_sessions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_match_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      appointment_requests: {
        Row: {
          appointment_type: string
          coach_id: string
          created_at: string
          expires_at: string
          id: string
          message: string | null
          player_id: string
          requested_date: string
          requested_end_time: string
          requested_start_time: string
          responded_at: string | null
          response_message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string
          coach_id: string
          created_at?: string
          expires_at?: string
          id?: string
          message?: string | null
          player_id: string
          requested_date: string
          requested_end_time: string
          requested_start_time: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          coach_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          message?: string | null
          player_id?: string
          requested_date?: string
          requested_end_time?: string
          requested_start_time?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          coach_id: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          end_time: string
          id: string
          location: string | null
          metadata: Json | null
          notes: string | null
          payment_status: string | null
          player_id: string
          price_amount: number | null
          scheduled_date: string
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          coach_id: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          end_time: string
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          payment_status?: string | null
          player_id: string
          price_amount?: number | null
          scheduled_date: string
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          coach_id?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          end_time?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          payment_status?: string | null
          player_id?: string
          price_amount?: number | null
          scheduled_date?: string
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      booster_cooldowns: {
        Row: {
          booster_id: string | null
          cooldown_expires_at: string
          created_at: string | null
          id: string
          last_purchased_at: string
          user_id: string | null
        }
        Insert: {
          booster_id?: string | null
          cooldown_expires_at: string
          created_at?: string | null
          id?: string
          last_purchased_at: string
          user_id?: string | null
        }
        Update: {
          booster_id?: string | null
          cooldown_expires_at?: string
          created_at?: string | null
          id?: string
          last_purchased_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booster_cooldowns_booster_id_fkey"
            columns: ["booster_id"]
            isOneToOne: false
            referencedRelation: "performance_boosters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booster_cooldowns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      club_memberships: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          logo_url: string | null
          member_count: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          logo_url?: string | null
          member_count?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          logo_url?: string | null
          member_count?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_achievement_progress: {
        Row: {
          achievement_id: string
          coach_id: string
          current_progress: number | null
          id: string
          last_updated: string
        }
        Insert: {
          achievement_id: string
          coach_id: string
          current_progress?: number | null
          id?: string
          last_updated?: string
        }
        Update: {
          achievement_id?: string
          coach_id?: string
          current_progress?: number | null
          id?: string
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "coach_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          reward_cxp: number | null
          reward_special: string | null
          reward_tokens: number | null
          tier: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          requirement_type: string
          requirement_value: number
          reward_cxp?: number | null
          reward_special?: string | null
          reward_tokens?: number | null
          tier?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          requirement_type?: string
          requirement_value?: number
          reward_cxp?: number | null
          reward_special?: string | null
          reward_tokens?: number | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_achievements_unlocked: {
        Row: {
          achievement_id: string
          claimed_at: string | null
          coach_id: string
          id: string
          is_claimed: boolean | null
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          claimed_at?: string | null
          coach_id: string
          id?: string
          is_claimed?: boolean | null
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          claimed_at?: string | null
          coach_id?: string
          id?: string
          is_claimed?: boolean | null
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_achievements_unlocked_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "coach_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_availability: {
        Row: {
          coach_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      coach_invitations: {
        Row: {
          accepted_at: string | null
          coach_id: string
          created_at: string
          expires_at: string
          id: string
          invitation_code: string
          message: string | null
          player_email: string
          player_id: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          coach_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invitation_code?: string
          message?: string | null
          player_email: string
          player_id?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          coach_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invitation_code?: string
          message?: string | null
          player_email?: string
          player_id?: string | null
          status?: string
        }
        Relationships: []
      }
      coach_leaderboards: {
        Row: {
          calculated_at: string
          coach_id: string
          created_at: string
          id: string
          leaderboard_type: string
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          period_type: string
          rank_position: number
          score_value: number
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          coach_id: string
          created_at?: string
          id?: string
          leaderboard_type: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          period_type?: string
          rank_position: number
          score_value: number
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          coach_id?: string
          created_at?: string
          id?: string
          leaderboard_type?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          period_type?: string
          rank_position?: number
          score_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_leaderboards_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_player_relationships: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          notes: string | null
          player_id: string
          relationship_type: string
          status: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          notes?: string | null
          player_id: string
          relationship_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          player_id?: string
          relationship_type?: string
          status?: string
          updated_at?: string
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
      coaching_challenges: {
        Row: {
          assigned_date: string
          challenge_type: string
          coach_id: string
          coach_notes: string | null
          completed_at: string | null
          created_at: string
          current_progress: number | null
          description: string
          due_date: string | null
          id: string
          metadata: Json | null
          player_id: string
          player_notes: string | null
          reward_tokens: number | null
          reward_xp: number | null
          status: string
          target_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          challenge_type: string
          coach_id: string
          coach_notes?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          description: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          player_id: string
          player_notes?: string | null
          reward_tokens?: number | null
          reward_xp?: number | null
          status?: string
          target_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          challenge_type?: string
          coach_id?: string
          coach_notes?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          description?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          player_id?: string
          player_notes?: string | null
          reward_tokens?: number | null
          reward_xp?: number | null
          status?: string
          target_value?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_challenges_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_challenges_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_requests: {
        Row: {
          budget_range: string | null
          coach_id: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          player_id: string
          preferred_date: string | null
          request_type: string
          responded_at: string | null
          response_message: string | null
          skills_focus: string[] | null
          status: string
          title: string
          updated_at: string
          urgency_level: string
        }
        Insert: {
          budget_range?: string | null
          coach_id?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          player_id: string
          preferred_date?: string | null
          request_type: string
          responded_at?: string | null
          response_message?: string | null
          skills_focus?: string[] | null
          status?: string
          title: string
          updated_at?: string
          urgency_level?: string
        }
        Update: {
          budget_range?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          player_id?: string
          preferred_date?: string | null
          request_type?: string
          responded_at?: string | null
          response_message?: string | null
          skills_focus?: string[] | null
          status?: string
          title?: string
          updated_at?: string
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_requests_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      feed_comments: {
        Row: {
          activity_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      hint_purchases: {
        Row: {
          cost_tokens: number
          hint_type: string
          id: string
          player_id: string
          purchased_at: string
          question_id: string
        }
        Insert: {
          cost_tokens?: number
          hint_type: string
          id?: string
          player_id: string
          purchased_at?: string
          question_id: string
        }
        Update: {
          cost_tokens?: number
          hint_type?: string
          id?: string
          player_id?: string
          purchased_at?: string
          question_id?: string
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
      lesson_sessions: {
        Row: {
          coach_id: string
          coach_notes: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          hourly_rate: number | null
          id: string
          lesson_plan: Json | null
          location: string | null
          player_feedback: string | null
          player_id: string
          rating: number | null
          scheduled_date: string
          session_type: string
          skills_focus: string[] | null
          status: string
          title: string
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          coach_notes?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          hourly_rate?: number | null
          id?: string
          lesson_plan?: Json | null
          location?: string | null
          player_feedback?: string | null
          player_id: string
          rating?: number | null
          scheduled_date: string
          session_type?: string
          skills_focus?: string[] | null
          status?: string
          title: string
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          coach_notes?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          hourly_rate?: number | null
          id?: string
          lesson_plan?: Json | null
          location?: string | null
          player_feedback?: string | null
          player_id?: string
          rating?: number | null
          scheduled_date?: string
          session_type?: string
          skills_focus?: string[] | null
          status?: string
          title?: string
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_preferences: {
        Row: {
          auto_update_location: boolean
          created_at: string
          id: string
          location_privacy_level: string
          search_radius_km: number
          show_coaches: boolean
          show_courts: boolean
          show_players: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_update_location?: boolean
          created_at?: string
          id?: string
          location_privacy_level?: string
          search_radius_km?: number
          show_coaches?: boolean
          show_courts?: boolean
          show_players?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_update_location?: boolean
          created_at?: string
          id?: string
          location_privacy_level?: string
          search_radius_km?: number
          show_coaches?: boolean
          show_courts?: boolean
          show_players?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_invitations: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          invitation_category: string
          invitation_type: string
          invitee_email: string | null
          invitee_id: string | null
          invitee_name: string
          inviter_id: string
          is_challenge: boolean | null
          match_session_id: string | null
          message: string | null
          responded_at: string | null
          session_data: Json | null
          stakes_premium_tokens: number | null
          stakes_tokens: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_category?: string
          invitation_type: string
          invitee_email?: string | null
          invitee_id?: string | null
          invitee_name: string
          inviter_id: string
          is_challenge?: boolean | null
          match_session_id?: string | null
          message?: string | null
          responded_at?: string | null
          session_data?: Json | null
          stakes_premium_tokens?: number | null
          stakes_tokens?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_category?: string
          invitation_type?: string
          invitee_email?: string | null
          invitee_id?: string | null
          invitee_name?: string
          inviter_id?: string
          is_challenge?: boolean | null
          match_session_id?: string | null
          message?: string | null
          responded_at?: string | null
          session_data?: Json | null
          stakes_premium_tokens?: number | null
          stakes_tokens?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_invitations_session"
            columns: ["match_session_id"]
            isOneToOne: false
            referencedRelation: "active_match_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invitations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invitations_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invitations_match_session_id_fkey"
            columns: ["match_session_id"]
            isOneToOne: false
            referencedRelation: "active_match_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          can_edit_score: boolean | null
          created_at: string | null
          id: string
          is_external: boolean | null
          joined_at: string | null
          match_session_id: string
          participant_name: string
          participant_role: string
          user_id: string | null
        }
        Insert: {
          can_edit_score?: boolean | null
          created_at?: string | null
          id?: string
          is_external?: boolean | null
          joined_at?: string | null
          match_session_id: string
          participant_name: string
          participant_role: string
          user_id?: string | null
        }
        Update: {
          can_edit_score?: boolean | null
          created_at?: string | null
          id?: string
          is_external?: boolean | null
          joined_at?: string | null
          match_session_id?: string
          participant_name?: string
          participant_role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_session_id_fkey"
            columns: ["match_session_id"]
            isOneToOne: false
            referencedRelation: "active_match_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_relationships: {
        Row: {
          activity_log_id: string | null
          created_at: string | null
          id: string
          match_result: string
          match_type: string
          player_1_id: string
          player_2_id: string
        }
        Insert: {
          activity_log_id?: string | null
          created_at?: string | null
          id?: string
          match_result: string
          match_type: string
          player_1_id: string
          player_2_id: string
        }
        Update: {
          activity_log_id?: string | null
          created_at?: string | null
          id?: string
          match_result?: string
          match_type?: string
          player_1_id?: string
          player_2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_relationships_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_relationships_player_1_id_fkey"
            columns: ["player_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_relationships_player_2_id_fkey"
            columns: ["player_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_progress: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_session_date: string | null
          longest_streak: number
          total_minutes: number
          total_sessions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_session_date?: string | null
          longest_streak?: number
          total_minutes?: number
          total_sessions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_session_date?: string | null
          longest_streak?: number
          total_minutes?: number
          total_sessions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meditation_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_sessions: {
        Row: {
          completed_at: string
          created_at: string
          duration_minutes: number
          hp_gained: number
          id: string
          session_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_minutes: number
          hp_gained?: number
          id?: string
          session_type?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_minutes?: number
          hp_gained?: number
          id?: string
          session_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meditation_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      performance_boosters: {
        Row: {
          cooldown_hours: number | null
          created_at: string | null
          description: string
          effect_data: Json
          effect_type: string
          icon_name: string
          id: string
          is_active: boolean | null
          name: string
          rarity: string | null
          token_price: number
        }
        Insert: {
          cooldown_hours?: number | null
          created_at?: string | null
          description: string
          effect_data: Json
          effect_type: string
          icon_name: string
          id?: string
          is_active?: boolean | null
          name: string
          rarity?: string | null
          token_price: number
        }
        Update: {
          cooldown_hours?: number | null
          created_at?: string | null
          description?: string
          effect_data?: Json
          effect_type?: string
          icon_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          rarity?: string | null
          token_price?: number
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
      player_training_assignments: {
        Row: {
          assigned_date: string
          coach_id: string
          coach_notes: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          due_date: string | null
          id: string
          player_feedback: string | null
          player_id: string
          status: string
          training_plan_id: string
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          coach_id: string
          coach_notes?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          player_feedback?: string | null
          player_id: string
          status?: string
          training_plan_id: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          coach_id?: string
          coach_notes?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          player_feedback?: string | null
          player_id?: string
          status?: string
          training_plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_training_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_training_assignments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_training_assignments_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
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
      progress_reports: {
        Row: {
          attachments: string[] | null
          coach_id: string
          coach_responded_at: string | null
          coach_response: string | null
          content: string
          created_at: string
          id: string
          metrics: Json | null
          player_id: string
          related_assignment_id: string | null
          related_challenge_id: string | null
          related_session_id: string | null
          report_type: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          coach_id: string
          coach_responded_at?: string | null
          coach_response?: string | null
          content: string
          created_at?: string
          id?: string
          metrics?: Json | null
          player_id: string
          related_assignment_id?: string | null
          related_challenge_id?: string | null
          related_session_id?: string | null
          report_type: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          coach_id?: string
          coach_responded_at?: string | null
          coach_response?: string | null
          content?: string
          created_at?: string
          id?: string
          metrics?: Json | null
          player_id?: string
          related_assignment_id?: string | null
          related_challenge_id?: string | null
          related_session_id?: string | null
          report_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_reports_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          category: string
          completed_at: string
          created_at: string
          hints_used: number
          id: string
          player_id: string
          questions_correct: number
          questions_total: number
          quiz_type: string
          score_percentage: number
          time_taken_seconds: number | null
          tokens_earned: number
          xp_earned: number
        }
        Insert: {
          category: string
          completed_at?: string
          created_at?: string
          hints_used?: number
          id?: string
          player_id: string
          questions_correct?: number
          questions_total: number
          quiz_type?: string
          score_percentage?: number
          time_taken_seconds?: number | null
          tokens_earned?: number
          xp_earned?: number
        }
        Update: {
          category?: string
          completed_at?: string
          created_at?: string
          hints_used?: number
          id?: string
          player_id?: string
          questions_correct?: number
          questions_total?: number
          quiz_type?: string
          score_percentage?: number
          time_taken_seconds?: number | null
          tokens_earned?: number
          xp_earned?: number
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          attempt_id: string
          correct_answer: number
          created_at: string
          hints_used: number
          id: string
          is_correct: boolean
          question_id: string
          question_text: string
          selected_answer: number | null
          time_taken_seconds: number | null
        }
        Insert: {
          attempt_id: string
          correct_answer: number
          created_at?: string
          hints_used?: number
          id?: string
          is_correct: boolean
          question_id: string
          question_text: string
          selected_answer?: number | null
          time_taken_seconds?: number | null
        }
        Update: {
          attempt_id?: string
          correct_answer?: number
          created_at?: string
          hints_used?: number
          id?: string
          is_correct?: boolean
          question_id?: string
          question_text?: string
          selected_answer?: number | null
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_schedules: {
        Row: {
          appointment_type: string
          coach_id: string
          created_at: string
          day_of_week: number | null
          duration_minutes: number
          end_date: string | null
          id: string
          is_active: boolean
          location: string | null
          player_id: string
          price_amount: number | null
          recurrence_pattern: string
          start_date: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string
          coach_id: string
          created_at?: string
          day_of_week?: number | null
          duration_minutes?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          player_id: string
          price_amount?: number | null
          recurrence_pattern: string
          start_date: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          coach_id?: string
          created_at?: string
          day_of_week?: number | null
          duration_minutes?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          player_id?: string
          price_amount?: number | null
          recurrence_pattern?: string
          start_date?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_schedules_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedules_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          address: string
          created_at: string
          id: string
          is_favorite: boolean
          location: unknown
          name: string
          notes: string | null
          place_id: string
          place_type: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          location: unknown
          name: string
          notes?: string | null
          place_id: string
          place_type: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          location?: unknown
          name?: string
          notes?: string | null
          place_id?: string
          place_type?: string
          user_id?: string
        }
        Relationships: []
      }
      session_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          session_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          session_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          session_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notifications_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          session_id: string
          stakes_contributed: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          session_id: string
          stakes_contributed?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          session_id?: string
          stakes_contributed?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_stakes_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          session_id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          session_id: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          session_id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_stakes_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          creator_id: string
          format: string | null
          id: string
          invitation_code: string | null
          is_private: boolean
          location: string | null
          max_players: number
          notes: string | null
          session_type: string
          stakes_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          format?: string | null
          id?: string
          invitation_code?: string | null
          is_private?: boolean
          location?: string | null
          max_players: number
          notes?: string | null
          session_type: string
          stakes_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          format?: string | null
          id?: string
          invitation_code?: string | null
          is_private?: boolean
          location?: string | null
          max_players?: number
          notes?: string | null
          session_type?: string
          stakes_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_play_access: {
        Row: {
          access_type: string
          created_at: string | null
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          access_type: string
          created_at?: string | null
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          access_type?: string
          created_at?: string | null
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_play_access_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "social_play_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_play_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_play_checkins: {
        Row: {
          checked_in_at: string
          id: string
          mood_emoji: string
          notes: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          id?: string
          mood_emoji: string
          notes?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          checked_in_at?: string
          id?: string
          mood_emoji?: string
          notes?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_play_checkins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "social_play_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_play_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_play_participants: {
        Row: {
          id: string
          invited_at: string
          joined_at: string | null
          role: string | null
          session_creator_id: string
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string
          joined_at?: string | null
          role?: string | null
          session_creator_id: string
          session_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string
          joined_at?: string | null
          role?: string | null
          session_creator_id?: string
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_social_participants_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "social_play_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_play_participants_session_creator_id_fkey"
            columns: ["session_creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_play_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "social_play_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_play_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_play_sessions: {
        Row: {
          competitive_level: string
          created_at: string
          created_by: string
          end_time: string | null
          final_score: string | null
          id: string
          location: string | null
          mood: string | null
          notes: string | null
          paused_duration: number | null
          session_type: string
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          competitive_level?: string
          created_at?: string
          created_by: string
          end_time?: string | null
          final_score?: string | null
          id?: string
          location?: string | null
          mood?: string | null
          notes?: string | null
          paused_duration?: number | null
          session_type: string
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          competitive_level?: string
          created_at?: string
          created_by?: string
          end_time?: string | null
          final_score?: string | null
          id?: string
          location?: string | null
          mood?: string | null
          notes?: string | null
          paused_duration?: number | null
          session_type?: string
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_play_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      stretching_progress: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_session_date: string | null
          longest_streak: number
          total_minutes: number
          total_sessions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_session_date?: string | null
          longest_streak?: number
          total_minutes?: number
          total_sessions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_session_date?: string | null
          longest_streak?: number
          total_minutes?: number
          total_sessions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stretching_routines: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty_level: string
          duration_minutes: number
          focus_areas: string[]
          hp_reward: number
          id: string
          is_active: boolean
          name: string
          stretches_data: Json
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty_level?: string
          duration_minutes: number
          focus_areas?: string[]
          hp_reward?: number
          id?: string
          is_active?: boolean
          name: string
          stretches_data: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty_level?: string
          duration_minutes?: number
          focus_areas?: string[]
          hp_reward?: number
          id?: string
          is_active?: boolean
          name?: string
          stretches_data?: Json
        }
        Relationships: []
      }
      stretching_sessions: {
        Row: {
          completed_at: string
          completed_stretches: Json | null
          completion_percentage: number
          created_at: string
          difficulty: string
          duration_minutes: number
          hp_gained: number
          id: string
          notes: string | null
          routine_id: string
          routine_name: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_stretches?: Json | null
          completion_percentage?: number
          created_at?: string
          difficulty?: string
          duration_minutes: number
          hp_gained?: number
          id?: string
          notes?: string | null
          routine_id: string
          routine_name: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_stretches?: Json | null
          completion_percentage?: number
          created_at?: string
          difficulty?: string
          duration_minutes?: number
          hp_gained?: number
          id?: string
          notes?: string | null
          routine_id?: string
          routine_name?: string
          user_id?: string
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
      training_plans: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          difficulty_level: string
          equipment_needed: string[] | null
          estimated_duration_minutes: number | null
          id: string
          instructions: Json | null
          is_active: boolean | null
          is_template: boolean | null
          name: string
          skills_focus: string[] | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          equipment_needed?: string[] | null
          estimated_duration_minutes?: number | null
          id?: string
          instructions?: Json | null
          is_active?: boolean | null
          is_template?: boolean | null
          name: string
          skills_focus?: string[] | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          equipment_needed?: string[] | null
          estimated_duration_minutes?: number | null
          id?: string
          instructions?: Json | null
          is_active?: boolean | null
          is_template?: boolean | null
          name?: string
          skills_focus?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_sharing_location: boolean
          last_updated: string
          location: unknown
          location_accuracy: number | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_sharing_location?: boolean
          last_updated?: string
          location: unknown
          location_accuracy?: number | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_sharing_location?: boolean
          last_updated?: string
          location?: unknown
          location_accuracy?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_performance_boosters: {
        Row: {
          booster_id: string | null
          effect_applied: boolean | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          purchased_at: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          booster_id?: string | null
          effect_applied?: boolean | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          purchased_at?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          booster_id?: string | null
          effect_applied?: boolean | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          purchased_at?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_performance_boosters_booster_id_fkey"
            columns: ["booster_id"]
            isOneToOne: false
            referencedRelation: "performance_boosters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_performance_boosters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      accept_coach_invitation: {
        Args: { invitation_code_param: string }
        Returns: Json
      }
      accept_match_invitation: {
        Args: { invitation_id: string }
        Returns: Json
      }
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
      add_feed_comment: {
        Args: {
          activity_id_param: string
          user_id_param: string
          content_param: string
        }
        Returns: string
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
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
      }
      approve_appointment_request: {
        Args: {
          request_id: string
          response_message_param?: string
          price_amount_param?: number
          location_param?: string
        }
        Returns: Json
      }
      assign_training_plan: {
        Args: {
          player_user_id: string
          training_plan_id: string
          due_date?: string
          coach_notes?: string
        }
        Returns: Json
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_coach_leaderboards: {
        Args: { leaderboard_type?: string; period_type?: string }
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
      check_coach_availability: {
        Args: {
          coach_user_id: string
          check_date: string
          start_time_param: string
          end_time_param: string
        }
        Returns: boolean
      }
      claim_achievement_reward: {
        Args: { user_id: string; achievement_id: string }
        Returns: Json
      }
      complete_academy_onboarding: {
        Args: { user_id: string; starting_level?: number }
        Returns: undefined
      }
      complete_meditation_session: {
        Args: {
          user_id: string
          duration_minutes: number
          session_type?: string
        }
        Returns: Json
      }
      complete_session: {
        Args:
          | { session_id_param: string; winner_id_param: string }
          | {
              session_id_param: string
              winner_id_param?: string
              completion_type?: string
            }
          | {
              session_id_param: string
              winner_id_param?: string
              completion_type?: string
              session_duration_minutes?: number
            }
        Returns: Json
      }
      complete_social_play_session: {
        Args: {
          session_id: string
          final_score?: string
          notes?: string
          mood?: string
        }
        Returns: Json
      }
      complete_stretching_session: {
        Args:
          | {
              user_id: string
              routine_id: string
              completed_stretches: Json
              notes?: string
            }
          | {
              user_id: string
              routine_id: string
              routine_name: string
              duration_minutes: number
              difficulty?: string
            }
        Returns: Json
      }
      complete_training_assignment: {
        Args: { assignment_id: string; player_feedback?: string }
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
      create_appointment_request: {
        Args: {
          coach_user_id: string
          requested_date_param: string
          requested_start_time_param: string
          requested_end_time_param: string
          appointment_type_param?: string
          message_param?: string
        }
        Returns: Json
      }
      create_coaching_challenge: {
        Args: {
          player_user_id: string
          challenge_type: string
          title: string
          description: string
          target_value: number
          due_date?: string
          reward_xp?: number
          reward_tokens?: number
        }
        Returns: Json
      }
      create_direct_conversation: {
        Args: { other_user_id: string; conversation_name?: string }
        Returns: string
      }
      create_match_invitation_with_stakes: {
        Args: {
          invitee_user_id: string
          invitee_user_name: string
          invitee_user_email?: string
          invitation_type_param?: string
          message_param?: string
          session_data_param?: Json
          stakes_tokens_param?: number
          stakes_premium_tokens_param?: number
          challenge_id_param?: string
        }
        Returns: Json
      }
      decline_match_invitation: {
        Args: { invitation_id: string }
        Returns: Json
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      equip_avatar_item: {
        Args: { user_id: string; item_id: string }
        Returns: Json
      }
      equip_coach_avatar_item: {
        Args: { user_id: string; item_id: string }
        Returns: Json
      }
      find_nearby_users: {
        Args: {
          search_latitude: number
          search_longitude: number
          radius_km?: number
          user_type?: string
        }
        Returns: {
          user_id: string
          full_name: string
          role: string
          avatar_url: string
          distance_km: number
          latitude: number
          longitude: number
          city: string
          last_updated: string
        }[]
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
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
      get_coach_leaderboard: {
        Args: {
          leaderboard_type?: string
          period_type?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          rank_position: number
          coach_id: string
          coach_name: string
          coach_avatar_url: string
          score_value: number
          metadata: Json
          calculated_at: string
        }[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_feed_comments: {
        Args: {
          activity_id_param: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          content: string
          created_at: string
          user_id: string
          user_name: string
          user_avatar: string
        }[]
      }
      get_feed_posts_with_engagement: {
        Args: {
          user_id_param: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          activity_type: string
          title: string
          description: string
          hp_impact: number
          xp_earned: number
          duration_minutes: number
          score: string
          opponent_name: string
          location: string
          logged_at: string
          player_id: string
          player_name: string
          player_avatar: string
          likes_count: number
          comments_count: number
          user_has_liked: boolean
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_upcoming_appointments: {
        Args: { user_id?: string; days_ahead?: number }
        Returns: {
          id: string
          coach_id: string
          player_id: string
          coach_name: string
          player_name: string
          title: string
          appointment_type: string
          scheduled_date: string
          start_time: string
          end_time: string
          duration_minutes: number
          status: string
          location: string
          price_amount: number
          created_at: string
        }[]
      }
      get_user_friends: {
        Args: { user_id: string }
        Returns: {
          friend_id: string
          friend_name: string
          friend_avatar_url: string
          connection_status: string
          connected_since: string
        }[]
      }
      get_user_match_sessions: {
        Args: { user_id: string }
        Returns: {
          completed_at: string | null
          created_at: string | null
          current_set: number
          end_mood: string | null
          final_score: string | null
          id: string
          is_doubles: boolean | null
          match_notes: string | null
          match_type: string
          mid_match_mood: string | null
          mid_match_notes: string | null
          opponent_1_id: string | null
          opponent_1_name: string | null
          opponent_2_id: string | null
          opponent_2_name: string | null
          opponent_id: string | null
          opponent_name: string
          partner_id: string | null
          partner_name: string | null
          pause_start_time: string | null
          player_id: string
          result: string | null
          sets: Json
          start_time: string
          status: string
          total_paused_duration: number | null
          updated_at: string | null
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      initialize_academy_progress: {
        Args: { user_id: string }
        Returns: undefined
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
      initialize_location_preferences: {
        Args: { user_id: string }
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
      is_session_invitee: {
        Args: { session_id: string }
        Returns: boolean
      }
      is_session_owner: {
        Args: { session_id: string }
        Returns: boolean
      }
      is_session_participant: {
        Args: { session_id: string }
        Returns: boolean
      }
      join_session: {
        Args: { session_id_param: string; user_id_param: string }
        Returns: Json
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      kick_participant: {
        Args: {
          session_id_param: string
          participant_id_param: string
          kicker_id_param: string
        }
        Returns: Json
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
      log_stakes_transaction: {
        Args: {
          session_id_param: string
          user_id_param: string
          transaction_type_param: string
          amount_param: number
          description_param: string
        }
        Returns: undefined
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      save_place: {
        Args: {
          place_id_param: string
          name_param: string
          address_param: string
          latitude: number
          longitude: number
          place_type_param: string
          notes_param?: string
          is_favorite_param?: boolean
        }
        Returns: Json
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
      send_coach_invitation: {
        Args: { player_email_param: string; message_param?: string }
        Returns: Json
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
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      start_session: {
        Args: { session_id_param: string; starter_id_param: string }
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
      submit_progress_report: {
        Args: {
          coach_user_id: string
          report_type: string
          title: string
          content: string
          related_assignment_id?: string
          related_challenge_id?: string
          related_session_id?: string
          metrics?: Json
        }
        Returns: Json
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      toggle_feed_like: {
        Args: { activity_id_param: string; user_id_param: string }
        Returns: boolean
      }
      unlock_avatar_item: {
        Args: { user_id: string; item_id: string; unlock_method?: string }
        Returns: Json
      }
      unlock_coach_avatar_item: {
        Args: { user_id: string; item_id: string; unlock_method?: string }
        Returns: Json
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_academy_progress: {
        Args: {
          user_id: string
          xp_gained?: number
          tokens_gained?: number
          quiz_completed?: boolean
        }
        Returns: Json
      }
      update_user_location: {
        Args: {
          latitude: number
          longitude: number
          address_param?: string
          city_param?: string
          country_param?: string
          accuracy_param?: number
          sharing_param?: boolean
        }
        Returns: Json
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
    }
    Enums: {
      user_role: "player" | "coach"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
