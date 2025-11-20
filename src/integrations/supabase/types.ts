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
      abuse_logs: {
        Row: {
          created_at: string | null
          id: number
          lat: number | null
          location_name: string | null
          lon: number | null
          message: string | null
          meta: Json | null
          reward_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          lat?: number | null
          location_name?: string | null
          lon?: number | null
          message?: string | null
          meta?: Json | null
          reward_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          lat?: number | null
          location_name?: string | null
          lon?: number | null
          message?: string | null
          meta?: Json | null
          reward_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abuse_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abuse_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      api_rate_limits: {
        Row: {
          created_at: string | null
          hits: number
          id: number
          reset_at: string
          route: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          hits?: number
          id?: number
          reset_at?: string
          route: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          hits?: number
          id?: number
          reset_at?: string
          route?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      battle_metrics: {
        Row: {
          battle_id: string | null
          created_at: string | null
          id: number
          key: string
          value: Json
        }
        Insert: {
          battle_id?: string | null
          created_at?: string | null
          id?: number
          key: string
          value?: Json
        }
        Update: {
          battle_id?: string | null
          created_at?: string | null
          id?: number
          key?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "battle_metrics_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      battles: {
        Row: {
          created_at: string | null
          id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string
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
      buzz_game_targets: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          lat: number
          lon: number
          radius_km: number | null
          source: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          lat: number
          lon: number
          radius_km?: number | null
          source?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          lat?: number
          lon?: number
          radius_km?: number | null
          source?: string | null
        }
        Relationships: []
      }
      buzz_grants: {
        Row: {
          created_at: string | null
          id: string
          remaining: number | null
          source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          remaining?: number | null
          source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          remaining?: number | null
          source?: string | null
          updated_at?: string | null
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
          device_type: string | null
          id: string
          is_active: boolean | null
          last_used: string | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
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
      legal_documents: {
        Row: {
          content: string | null
          id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
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
      mission_enrollments: {
        Row: {
          created_at: string | null
          id: string
          mission_id: string | null
          state: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mission_id?: string | null
          state?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mission_id?: string | null
          state?: string | null
          user_id?: string
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
      payment_transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          provider: string
          provider_ref: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          provider?: string
          provider_ref?: string | null
          status: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          provider?: string
          provider_ref?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          access_enabled: boolean | null
          access_start_date: string | null
          agent_code: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          first_login_completed: boolean | null
          full_name: string | null
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
          status: string | null
          subscription_plan: string | null
          total_referrals: number
          updated_at: string | null
        }
        Insert: {
          access_enabled?: boolean | null
          access_start_date?: string | null
          agent_code?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_login_completed?: boolean | null
          full_name?: string | null
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
          status?: string | null
          subscription_plan?: string | null
          total_referrals?: number
          updated_at?: string | null
        }
        Update: {
          access_enabled?: boolean | null
          access_start_date?: string | null
          agent_code?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_login_completed?: boolean | null
          full_name?: string | null
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
          status?: string | null
          subscription_plan?: string | null
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
      push_delivery_logs: {
        Row: {
          channel: string
          created_at: string | null
          details: Json | null
          id: number
          message_tag: string | null
          status: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          details?: Json | null
          id?: number
          message_tag?: string | null
          status: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          details?: Json | null
          id?: number
          message_tag?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_delivery_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_delivery_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          is_used: boolean
          lat: number | null
          lng: number | null
          location_name: string | null
          max_scans: number | null
          qr_type: string
          reward_id: string | null
          reward_type: string
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
          is_used?: boolean
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_scans?: number | null
          qr_type: string
          reward_id?: string | null
          reward_type?: string
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
          is_used?: boolean
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_scans?: number | null
          qr_type?: string
          reward_id?: string | null
          reward_type?: string
          scanned_count?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qr_rewards: {
        Row: {
          amount: number | null
          code_id: string
          created_at: string
          id: string
          lat: number | null
          location_name: string | null
          lon: number | null
          message: string | null
          reward_type: string
        }
        Insert: {
          amount?: number | null
          code_id: string
          created_at?: string
          id?: string
          lat?: number | null
          location_name?: string | null
          lon?: number | null
          message?: string | null
          reward_type: string
        }
        Update: {
          amount?: number | null
          code_id?: string
          created_at?: string
          id?: string
          lat?: number | null
          location_name?: string | null
          lon?: number | null
          message?: string | null
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_rewards_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "qr_buzz_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_rewards_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
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
      scheduled_notifications: {
        Row: {
          created_at: string
          error_message: string | null
          executed_at: string | null
          id: string
          message: Json
          scheduled_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          message: Json
          scheduled_at: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          message?: Json
          scheduled_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          plan: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_consents: {
        Row: {
          created_at: string
          granted: boolean
          id: string
          purpose: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted: boolean
          id?: string
          purpose: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          id?: string
          purpose?: string
          user_id?: string
        }
        Relationships: []
      }
      user_cookie_preferences: {
        Row: {
          analytics: boolean
          marketing: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics?: boolean
          marketing?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics?: boolean
          marketing?: boolean
          updated_at?: string
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
      user_minigames_progress: {
        Row: {
          game_key: string
          id: number
          progress_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          game_key: string
          id?: number
          progress_json?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          game_key?: string
          id?: number
          progress_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_minigames_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_minigames_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mission_status: {
        Row: {
          id: string
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          state?: string | null
          updated_at?: string | null
          user_id?: string
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
      user_notification_prefs: {
        Row: {
          muted: boolean
          notif_type: string
          prefs: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          muted?: boolean
          notif_type: string
          prefs?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          muted?: boolean
          notif_type?: string
          prefs?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          archived_at: string | null
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
          archived_at?: string | null
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
          archived_at?: string | null
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
      user_reward_claims: {
        Row: {
          claimed_at: string
          id: string
          metadata: Json | null
          reward_key: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          metadata?: Json | null
          reward_key: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          metadata?: Json | null
          reward_key?: string
          user_id?: string
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
          endpoint: string | null
          id: string
          is_active: boolean | null
          subscription: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean | null
          subscription: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string | null
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
          pulse_energy: number | null
          rank_id: number | null
          total_referrals: number | null
        }
        Insert: {
          agent_code?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          investigative_style?: string | null
          nickname?: string | null
          pulse_energy?: number | null
          rank_id?: number | null
          total_referrals?: number | null
        }
        Update: {
          agent_code?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          investigative_style?: string | null
          nickname?: string | null
          pulse_energy?: number | null
          rank_id?: number | null
          total_referrals?: number | null
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
      push_subscriptions: {
        Row: {
          created_at: string | null
          endpoint: string | null
          id: string | null
          is_active: boolean | null
          platform: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint?: never
          id?: string | null
          is_active?: boolean | null
          platform?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: never
          id?: string | null
          is_active?: boolean | null
          platform?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      qr_buzz_codes: {
        Row: {
          code: string | null
          created_at: string | null
          id: string | null
          is_used: boolean | null
          lat: number | null
          lng: number | null
          location_name: string | null
          reward_id: string | null
          reward_type: string | null
          title: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string | null
          is_used?: boolean | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          reward_id?: string | null
          reward_type?: string | null
          title?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string | null
          is_used?: boolean | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          reward_id?: string | null
          reward_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      v_user_buzz_counter_compat: {
        Row: {
          buzz_count: number | null
          counter_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buzz_count?: number | null
          counter_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buzz_count?: number | null
          counter_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_user_buzz_daily: {
        Row: {
          buzz_count: number | null
          date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buzz_count?: number | null
          date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buzz_count?: number | null
          date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_user_buzz_map_counter_compat: {
        Row: {
          buzz_map_count: number | null
          counter_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buzz_map_count?: number | null
          counter_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buzz_map_count?: number | null
          counter_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_user_buzz_map_daily: {
        Row: {
          buzz_map_count: number | null
          date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buzz_map_count?: number | null
          date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buzz_map_count?: number | null
          date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_user_inbox: {
        Row: {
          archived_at: string | null
          created_at: string | null
          id: string | null
          is_read: boolean | null
          message: string | null
          read_at: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          id?: string | null
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          id?: string | null
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      winners_public: {
        Row: {
          agent_code: string | null
          avatar_url: string | null
          completion_time: string | null
          id: string | null
          mission_code: string | null
          mission_title: string | null
          nickname: string | null
          prize_image: string | null
          prize_name: string | null
          prize_value: number | null
          winner_user_id: string | null
        }
        Relationships: [
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
      can_user_access_mission: { Args: { p_user: string }; Returns: boolean }
      consume_credit: {
        Args: { p_amount: number; p_credit_type: string; p_user_id: string }
        Returns: boolean
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      generate_unique_agent_code: { Args: never; Returns: string }
      get_my_agent_code: { Args: never; Returns: string }
      get_my_notifications: {
        Args: { p_before?: string; p_limit?: number }
        Returns: {
          archived_at: string | null
          created_at: string
          id: string
          is_deleted: boolean | null
          is_read: boolean
          message: string
          read_at: string | null
          title: string | null
          type: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "user_notifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
      set_notification_archived: {
        Args: { p_archived: boolean; p_id: string }
        Returns: boolean
      }
      validate_buzz_user_id: { Args: { p_user: string }; Returns: boolean }
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
