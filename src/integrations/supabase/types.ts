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
      admin_logs: {
        Row: {
          admin_id: string
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          target_user_id: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          target_user_id?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      agent_ranks: {
        Row: {
          code: string
          color: string
          created_at: string | null
          description: string | null
          id: number
          name_en: string
          name_it: string
          pe_max: number | null
          pe_min: number
          symbol: string
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string
          created_at?: string | null
          description?: string | null
          id?: number
          name_en: string
          name_it: string
          pe_max?: number | null
          pe_min?: number
          symbol?: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string
          created_at?: string | null
          description?: string | null
          id?: number
          name_en?: string
          name_it?: string
          pe_max?: number | null
          pe_min?: number
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          updated_at: string | null
          updated_by: string | null
          value_int: number | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          value_int?: number | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          value_int?: number | null
        }
        Relationships: []
      }
      app_messages: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_read: boolean | null
          message_type: string
          target_users: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message_type: string
          target_users?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message_type?: string
          target_users?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      buzz_activations: {
        Row: {
          created_at: string | null
          id: string
          location: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      buzz_map_actions: {
        Row: {
          clue_count: number | null
          cost_eur: number | null
          cost_m1u: number | null
          created_at: string | null
          id: string
          radius_generated: number | null
          user_id: string
        }
        Insert: {
          clue_count?: number | null
          cost_eur?: number | null
          cost_m1u?: number | null
          created_at?: string | null
          id?: string
          radius_generated?: number | null
          user_id: string
        }
        Update: {
          clue_count?: number | null
          cost_eur?: number | null
          cost_m1u?: number | null
          created_at?: string | null
          id?: string
          radius_generated?: number | null
          user_id?: string
        }
        Relationships: []
      }
      buzz_map_activations: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      cron_logs: {
        Row: {
          created_at: string | null
          id: number
          job: string
          payload: Json | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          job: string
          payload?: Json | null
          status: string
        }
        Update: {
          created_at?: string | null
          id?: number
          job?: string
          payload?: Json | null
          status?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      final_shots: {
        Row: {
          completion_time: string
          created_at: string | null
          id: string
          metadata: Json | null
          mission_id: string | null
          prize_id: string | null
          proof_url: string | null
          winner_user_id: string
        }
        Insert: {
          completion_time?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mission_id?: string | null
          prize_id?: string | null
          proof_url?: string | null
          winner_user_id: string
        }
        Update: {
          completion_time?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mission_id?: string | null
          prize_id?: string | null
          proof_url?: string | null
          winner_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "final_shots_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_shots_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_shots_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_shots_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marker_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          marker_id: string
          payload: Json | null
          reward_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          marker_id: string
          payload?: Json | null
          reward_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          marker_id?: string
          payload?: Json | null
          reward_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          difficulty: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          objectives: Json | null
          prize_id: string | null
          publication_date: string | null
          rewards: Json | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          objectives?: Json | null
          prize_id?: string | null
          publication_date?: string | null
          rewards?: Json | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          objectives?: Json | null
          prize_id?: string | null
          publication_date?: string | null
          rewards?: Json | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      norah_events: {
        Row: {
          context: Json | null
          created_at: string | null
          event: string
          id: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          event: string
          id?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          event?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      pre_registered_users: {
        Row: {
          agent_code: string | null
          converted_at: string | null
          email: string
          id: string
          is_converted: boolean | null
          registered_at: string | null
        }
        Insert: {
          agent_code?: string | null
          converted_at?: string | null
          email: string
          id?: string
          is_converted?: boolean | null
          registered_at?: string | null
        }
        Update: {
          agent_code?: string | null
          converted_at?: string | null
          email?: string
          id?: string
          is_converted?: boolean | null
          registered_at?: string | null
        }
        Relationships: []
      }
      prize_clues: {
        Row: {
          clue_text: string
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          prize_id: string | null
        }
        Insert: {
          clue_text: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          prize_id?: string | null
        }
        Update: {
          clue_text?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          prize_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prize_clues_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      prizes: {
        Row: {
          claimed: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          quantity: number | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          claimed?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          quantity?: number | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          claimed?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          quantity?: number | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agent_code: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          first_login_completed: boolean | null
          id: string
          investigative_style: string | null
          invited_by_code: string | null
          m1_units: number
          nickname: string | null
          pulse_energy: number
          rank_id: number | null
          rank_updated_at: string | null
          referral_code_used: boolean | null
          role: string | null
          total_referrals: number
          updated_at: string | null
        }
        Insert: {
          agent_code?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_login_completed?: boolean | null
          id: string
          investigative_style?: string | null
          invited_by_code?: string | null
          m1_units?: number
          nickname?: string | null
          pulse_energy?: number
          rank_id?: number | null
          rank_updated_at?: string | null
          referral_code_used?: boolean | null
          role?: string | null
          total_referrals?: number
          updated_at?: string | null
        }
        Update: {
          agent_code?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_login_completed?: boolean | null
          id?: string
          investigative_style?: string | null
          invited_by_code?: string | null
          m1_units?: number
          nickname?: string | null
          pulse_energy?: number
          rank_id?: number | null
          rank_updated_at?: string | null
          referral_code_used?: boolean | null
          role?: string | null
          total_referrals?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "agent_ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_scans: number | null
          qr_type: string
          scanned_count: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_scans?: number | null
          qr_type: string
          scanned_count?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_scans?: number | null
          qr_type?: string
          scanned_count?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rank_history: {
        Row: {
          created_at: string | null
          delta_pe: number
          id: string
          metadata: Json | null
          new_rank_id: number
          old_rank_id: number | null
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delta_pe: number
          id?: string
          metadata?: Json | null
          new_rank_id: number
          old_rank_id?: number | null
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          delta_pe?: number
          id?: string
          metadata?: Json | null
          new_rank_id?: number
          old_rank_id?: number | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_history_new_rank_id_fkey"
            columns: ["new_rank_id"]
            isOneToOne: false
            referencedRelation: "agent_ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_history_old_rank_id_fkey"
            columns: ["old_rank_id"]
            isOneToOne: false
            referencedRelation: "agent_ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_buzz_counter: {
        Row: {
          counter_date: string
          created_at: string | null
          daily_count: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          counter_date?: string
          created_at?: string | null
          daily_count?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          counter_date?: string
          created_at?: string | null
          daily_count?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_buzz_map_counter: {
        Row: {
          counter_date: string
          created_at: string | null
          daily_count: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          counter_date?: string
          created_at?: string | null
          daily_count?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          counter_date?: string
          created_at?: string | null
          daily_count?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_clues: {
        Row: {
          buzz_cost: number | null
          clue_id: string
          clue_type: string | null
          created_at: string | null
          description_it: string | null
          id: string
          title_it: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          buzz_cost?: number | null
          clue_id: string
          clue_type?: string | null
          created_at?: string | null
          description_it?: string | null
          id?: string
          title_it?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          buzz_cost?: number | null
          clue_id?: string
          clue_type?: string | null
          created_at?: string | null
          description_it?: string | null
          id?: string
          title_it?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          free_buzz_credit: number
          free_buzz_map_credit: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          free_buzz_credit?: number
          free_buzz_map_credit?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          free_buzz_credit?: number
          free_buzz_map_credit?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_map_areas: {
        Row: {
          active: boolean | null
          center_lat: number | null
          center_lng: number | null
          created_at: string | null
          id: string
          lat: number
          level: number | null
          lng: number
          price_eur: number | null
          radius_km: number
          source: string
          user_id: string
          week: number
        }
        Insert: {
          active?: boolean | null
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string | null
          id?: string
          lat: number
          level?: number | null
          lng: number
          price_eur?: number | null
          radius_km: number
          source?: string
          user_id: string
          week: number
        }
        Update: {
          active?: boolean | null
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string | null
          id?: string
          lat?: number
          level?: number | null
          lng?: number
          price_eur?: number | null
          radius_km?: number
          source?: string
          user_id?: string
          week?: number
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          completed_at: string | null
          id: string
          mission_id: string
          progress: Json | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          mission_id: string
          progress?: Json | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          mission_id?: string
          progress?: Json | null
          started_at?: string | null
          status?: string
          user_id?: string
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
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean | null
          is_read: boolean
          message: string
          read_at: string | null
          title: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean
          message: string
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_push_tokens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string | null
          id: string
          invitee_id: string
          inviter_id: string
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string | null
          xp_awarded: boolean
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitee_id: string
          inviter_id: string
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string | null
          xp_awarded?: boolean
        }
        Update: {
          created_at?: string | null
          id?: string
          invitee_id?: string
          inviter_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string | null
          xp_awarded?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          metadata: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          metadata?: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          buzz_xp_progress: number
          created_at: string | null
          map_xp_progress: number
          total_xp: number
          updated_at: string | null
          user_id: string
          xp_since_reward: number
        }
        Insert: {
          buzz_xp_progress?: number
          created_at?: string | null
          map_xp_progress?: number
          total_xp?: number
          updated_at?: string | null
          user_id: string
          xp_since_reward?: number
        }
        Update: {
          buzz_xp_progress?: number
          created_at?: string | null
          map_xp_progress?: number
          total_xp?: number
          updated_at?: string | null
          user_id?: string
          xp_since_reward?: number
        }
        Relationships: []
      }
      webpush_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          subscription: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subscription: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subscription?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          agent_code: string | null
          avatar_url: string | null
          created_at: string | null
          id: string | null
          investigative_style: string | null
          nickname: string | null
          rank_id: number | null
        }
        Insert: {
          agent_code?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          investigative_style?: string | null
          nickname?: string | null
          rank_id?: number | null
        }
        Update: {
          agent_code?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          investigative_style?: string | null
          nickname?: string | null
          rank_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "agent_ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      winners_public: {
        Row: {
          agent_code: string | null
          avatar_url: string | null
          completion_time: string | null
          id: string | null
          mission_id: string | null
          nickname: string | null
          prize_id: string | null
          prize_title: string | null
          winner_user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "final_shots_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_shots_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_shots_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_shots_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      award_pulse_energy: {
        Args: {
          p_delta_pe: number
          p_metadata?: Json
          p_reason: string
          p_user_id: string
        }
        Returns: Json
      }
      buzz_map_spend_m1u: {
        Args: {
          p_cost_m1u: number
          p_latitude: number
          p_longitude: number
          p_radius_km: number
          p_user_id: string
        }
        Returns: {
          error: string
          new_balance: number
          spent: number
          success: boolean
        }[]
      }
      consume_credit: {
        Args: { p_amount: number; p_credit_type: string; p_user_id: string }
        Returns: boolean
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_my_agent_code: { Args: never; Returns: string }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      m1_get_next_buzz_level: {
        Args: { p_user_id: string }
        Returns: {
          cost_m1u: number
          level: number
          radius_km: number
        }[]
      }
      recompute_rank: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "agent"
      referral_status: "pending" | "registered"
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
      app_role: ["admin", "moderator", "agent"],
      referral_status: ["pending", "registered"],
    },
  },
} as const
