export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abuse_alerts: {
        Row: {
          alert_timestamp: string
          event_count: number
          event_type: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          alert_timestamp?: string
          event_count: number
          event_type: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          alert_timestamp?: string
          event_count?: number
          event_type?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      abuse_logs: {
        Row: {
          event_type: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          event_type: string
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          event_type?: string
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          context: string | null
          created_at: string
          device: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          note: string | null
          reason: string | null
          route: string | null
          status_code: number | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          device?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          note?: string | null
          reason?: string | null
          route?: string | null
          status_code?: number | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          device?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          note?: string | null
          reason?: string | null
          route?: string | null
          status_code?: number | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_prizes: {
        Row: {
          address: string
          city: string
          created_at: string | null
          created_by: string
          description: string
          id: string
          is_active: boolean | null
          type: string
          week: number
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          is_active?: boolean | null
          type: string
          week: number
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean | null
          type?: string
          week?: number
        }
        Relationships: []
      }
      ai_generated_clues: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          language: string | null
          mission_id: string | null
          prompt_used: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          language?: string | null
          mission_id?: string | null
          prompt_used: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          language?: string | null
          mission_id?: string | null
          prompt_used?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown
          last_request: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: unknown
          last_request?: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          last_request?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      app_messages: {
        Row: {
          content: string
          created_at: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_read: boolean | null
          message_type: string
          target_users: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message_type?: string
          target_users?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message_type?: string
          target_users?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_date: string
          backup_type: string
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          file_size: number | null
          id: string
          status: string
          storage_path: string | null
        }
        Insert: {
          backup_date?: string
          backup_type?: string
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          file_size?: number | null
          id?: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          backup_date?: string
          backup_type?: string
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          file_size?: number | null
          id?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          attempts: number
          blocked_at: string
          created_at: string
          id: string
          ip_address: unknown
          reason: string
          unblock_at: string
        }
        Insert: {
          attempts?: number
          blocked_at?: string
          created_at?: string
          id?: string
          ip_address: unknown
          reason?: string
          unblock_at: string
        }
        Update: {
          attempts?: number
          blocked_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          reason?: string
          unblock_at?: string
        }
        Relationships: []
      }
      buzz_game_targets: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          is_active: boolean
          lat: number
          lon: number
          prize_description: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          lat: number
          lon: number
          prize_description: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          lat?: number
          lon?: number
          prize_description?: string
        }
        Relationships: []
      }
      buzz_generation_logs: {
        Row: {
          buzz_count_generated: number
          clues_generated: number
          created_at: string
          id: string
          subscription_tier: string
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          buzz_count_generated: number
          clues_generated: number
          created_at?: string
          id?: string
          subscription_tier: string
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          buzz_count_generated?: number
          clues_generated?: number
          created_at?: string
          id?: string
          subscription_tier?: string
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
      buzz_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          id: string
          step: string
          user_id: string
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          step: string
          user_id: string
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          step?: string
          user_id?: string
        }
        Relationships: []
      }
      buzz_map_actions: {
        Row: {
          clue_count: number
          cost_eur: number
          created_at: string
          id: string
          radius_generated: number
          user_id: string
        }
        Insert: {
          clue_count: number
          cost_eur: number
          created_at?: string
          id?: string
          radius_generated: number
          user_id: string
        }
        Update: {
          clue_count?: number
          cost_eur?: number
          created_at?: string
          id?: string
          radius_generated?: number
          user_id?: string
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          amount_total: number | null
          completed_at: string | null
          created_at: string
          currency: string | null
          id: string
          payment_status: string | null
          session_id: string
          status: string
          stripe_customer_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_total?: number | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_status?: string | null
          session_id: string
          status?: string
          stripe_customer_id?: string | null
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_total?: number | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_status?: string | null
          session_id?: string
          status?: string
          stripe_customer_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clues: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          is_locked: boolean
          is_premium: boolean
          parent_id: string | null
          premium_type: string | null
          title: string
        }
        Insert: {
          created_at?: string
          date?: string
          description: string
          id?: string
          image_url?: string | null
          is_locked?: boolean
          is_premium?: boolean
          parent_id?: string | null
          premium_type?: string | null
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          is_locked?: boolean
          is_premium?: boolean
          parent_id?: string | null
          premium_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "clues_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "clues"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_history: {
        Row: {
          consent_given: boolean
          consent_timestamp: string | null
          consent_type: string
          consent_version: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_given: boolean
          consent_timestamp?: string | null
          consent_type: string
          consent_version?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_given?: boolean
          consent_timestamp?: string | null
          consent_type?: string
          consent_version?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      current_mission_data: {
        Row: {
          city: string
          country: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          prize_category: string
          prize_color: string
          prize_material: string
          prize_type: string
          street: string
          street_number: string
          updated_at: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          prize_category: string
          prize_color: string
          prize_material: string
          prize_type: string
          street: string
          street_number: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          prize_category?: string
          prize_color?: string
          prize_material?: string
          prize_type?: string
          street?: string
          street_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_final_shot_limits: {
        Row: {
          attempt_date: string
          attempts_count: number
          created_at: string
          id: string
          mission_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_date?: string
          attempts_count?: number
          created_at?: string
          id?: string
          mission_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_date?: string
          attempts_count?: number
          created_at?: string
          id?: string
          mission_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_spin_logs: {
        Row: {
          client_ip: string | null
          created_at: string
          date: string
          id: string
          prize: string
          rotation_deg: number
          user_id: string
        }
        Insert: {
          client_ip?: string | null
          created_at?: string
          date: string
          id?: string
          prize: string
          rotation_deg: number
          user_id: string
        }
        Update: {
          client_ip?: string | null
          created_at?: string
          date?: string
          id?: string
          prize?: string
          rotation_deg?: number
          user_id?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          device_type: string
          id: string
          last_used: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type: string
          id?: string
          last_used?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string
          id?: string
          last_used?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      final_shot_rules: {
        Row: {
          cooldown_hours: number | null
          created_at: string
          id: string
          max_attempts: number | null
          mission_id: string
          tolerance_meters: number | null
          unlock_days_before_end: number | null
        }
        Insert: {
          cooldown_hours?: number | null
          created_at?: string
          id?: string
          max_attempts?: number | null
          mission_id: string
          tolerance_meters?: number | null
          unlock_days_before_end?: number | null
        }
        Update: {
          cooldown_hours?: number | null
          created_at?: string
          id?: string
          max_attempts?: number | null
          mission_id?: string
          tolerance_meters?: number | null
          unlock_days_before_end?: number | null
        }
        Relationships: []
      }
      final_shots: {
        Row: {
          attempt_number: number | null
          created_at: string
          distance_meters: number | null
          feedback_direction: string | null
          feedback_distance: number | null
          id: string
          is_winner: boolean | null
          latitude: number
          longitude: number
          mission_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string
          distance_meters?: number | null
          feedback_direction?: string | null
          feedback_distance?: number | null
          id?: string
          is_winner?: boolean | null
          latitude: number
          longitude: number
          mission_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_number?: number | null
          created_at?: string
          distance_meters?: number | null
          feedback_direction?: string | null
          feedback_distance?: number | null
          id?: string
          is_winner?: boolean | null
          latitude?: number
          longitude?: number
          mission_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      geo_radar_coordinates: {
        Row: {
          created_at: string | null
          id: string
          label: string | null
          lat: number | null
          lng: number | null
          mission_id: string | null
          radius: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label?: string | null
          lat?: number | null
          lng?: number | null
          mission_id?: string | null
          radius?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string | null
          lat?: number | null
          lng?: number | null
          mission_id?: string | null
          radius?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      intelligence_tool_usage: {
        Row: {
          created_at: string
          id: string
          mission_id: string | null
          tool_name: string
          used_on: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mission_id?: string | null
          tool_name: string
          used_on?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mission_id?: string | null
          tool_name?: string
          used_on?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content_md: string
          created_at: string | null
          id: string
          is_active: boolean | null
          published_at: string | null
          title: string
          type: string
          version: string
        }
        Insert: {
          content_md: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          title: string
          type: string
          version: string
        }
        Update: {
          content_md?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          title?: string
          type?: string
          version?: string
        }
        Relationships: []
      }
      live_activity_state: {
        Row: {
          created_at: string
          id: string
          mission: string
          progress: number
          route: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mission: string
          progress?: number
          route?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mission?: string
          progress?: number
          route?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_events: {
        Row: {
          created_at: string | null
          id: string
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
        }
        Relationships: []
      }
      map_click_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          lat: number
          lng: number
          user_id: string
          zoom: number
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          lat: number
          lng: number
          user_id: string
          zoom?: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          lat?: number
          lng?: number
          user_id?: string
          zoom?: number
        }
        Relationships: []
      }
      map_points: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          note: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          note?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          note?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_targets: {
        Row: {
          created_at: string
          id: string
          is_revealed: boolean | null
          latitude: number
          longitude: number
          mission_id: string
          target_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_revealed?: boolean | null
          latitude: number
          longitude: number
          mission_id: string
          target_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          is_revealed?: boolean | null
          latitude?: number
          longitude?: number
          mission_id?: string
          target_hash?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          publication_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          publication_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          publication_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      monthly_missions: {
        Row: {
          area_radius_km: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          prize_description: string | null
          scope: string
          start_date: string | null
          status: string
          target_location: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          area_radius_km?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          prize_description?: string | null
          scope?: string
          start_date?: string | null
          status?: string
          target_location?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          area_radius_km?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          prize_description?: string | null
          scope?: string
          start_date?: string | null
          status?: string
          target_location?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          campaign: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          referrer: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      panel_logs: {
        Row: {
          area_radius_assigned: number | null
          created_at: string
          details: Json | null
          event_type: string
          id: string
          mission_id: string | null
          user_count: number | null
        }
        Insert: {
          area_radius_assigned?: number | null
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          mission_id?: string | null
          user_count?: number | null
        }
        Update: {
          area_radius_assigned?: number | null
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          mission_id?: string | null
          user_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_logs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "monthly_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_intent_id: string
          plan: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id: string
          plan: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string
          plan?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          provider: string
          provider_transaction_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          provider?: string
          provider_transaction_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          provider?: string
          provider_transaction_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      pre_registrations: {
        Row: {
          confirmed: boolean
          created_at: string
          created_by: string | null
          credits: number
          email: string
          id: string
          name: string
          referral_code: string | null
          referrer: string | null
          user_id: string | null
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          created_by?: string | null
          credits?: number
          email: string
          id?: string
          name: string
          referral_code?: string | null
          referrer?: string | null
          user_id?: string | null
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          created_by?: string | null
          credits?: number
          email?: string
          id?: string
          name?: string
          referral_code?: string | null
          referrer?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      prize_clues: {
        Row: {
          clue_type: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          description_it: string
          id: string
          prize_id: string
          title_en: string | null
          title_fr: string | null
          title_it: string
          week: number
        }
        Insert: {
          clue_type?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_it: string
          id?: string
          prize_id: string
          title_en?: string | null
          title_fr?: string | null
          title_it: string
          week: number
        }
        Update: {
          clue_type?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_it?: string
          id?: string
          prize_id?: string
          title_en?: string | null
          title_fr?: string | null
          title_it?: string
          week?: number
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
          acceleration: string | null
          area_radius_m: number | null
          created_at: string
          description: string | null
          end_date: string | null
          engine: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          lat: number | null
          lng: number | null
          location_address: string | null
          name: string | null
          power: string | null
          start_date: string | null
          title: string | null
          traction: string | null
        }
        Insert: {
          acceleration?: string | null
          area_radius_m?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          engine?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          location_address?: string | null
          name?: string | null
          power?: string | null
          start_date?: string | null
          title?: string | null
          traction?: string | null
        }
        Update: {
          acceleration?: string | null
          area_radius_m?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          engine?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          location_address?: string | null
          name?: string | null
          power?: string | null
          start_date?: string | null
          title?: string | null
          traction?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          agent_code: string | null
          agent_title: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          credits: number | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          investigative_style: string | null
          language: string | null
          last_name: string | null
          notifications_enabled: boolean | null
          phone: string | null
          plan: string | null
          postal_code: string | null
          preferred_language: string | null
          preferred_rewards: string[] | null
          recovery_key: string | null
          referral_code: string | null
          role: string
          stripe_customer_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: string
          tier: string | null
          updated_at: string
          username: string | null
          weekly_hints: string | null
        }
        Insert: {
          address?: string | null
          agent_code?: string | null
          agent_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          investigative_style?: string | null
          language?: string | null
          last_name?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          preferred_rewards?: string[] | null
          recovery_key?: string | null
          referral_code?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string
          tier?: string | null
          updated_at?: string
          username?: string | null
          weekly_hints?: string | null
        }
        Update: {
          address?: string | null
          agent_code?: string | null
          agent_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          investigative_style?: string | null
          language?: string | null
          last_name?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          preferred_rewards?: string[] | null
          recovery_key?: string | null
          referral_code?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string
          tier?: string | null
          updated_at?: string
          username?: string | null
          weekly_hints?: string | null
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          notification_type: string
          payload: Json | null
          scheduled_for: string
          sent_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          notification_type: string
          payload?: Json | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          notification_type?: string
          payload?: Json | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_areas: {
        Row: {
          created_at: string
          id: string
          label: string | null
          lat: number
          lng: number
          radius: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          lat: number
          lng: number
          radius: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          lat?: number
          lng?: number
          radius?: number
          user_id?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          buzz_days: string[]
          created_at: string
          id: string
          max_weekly_buzz: number
          name: string
          price_monthly: number
          stripe_price_id: string | null
        }
        Insert: {
          buzz_days?: string[]
          created_at?: string
          id?: string
          max_weekly_buzz?: number
          name: string
          price_monthly: number
          stripe_price_id?: string | null
        }
        Update: {
          buzz_days?: string[]
          created_at?: string
          id?: string
          max_weekly_buzz?: number
          name?: string
          price_monthly?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          provider: string
          provider_subscription_id: string | null
          start_date: string
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          provider?: string
          provider_subscription_id?: string | null
          start_date?: string
          status?: string
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          provider?: string
          provider_subscription_id?: string | null
          start_date?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_buzz_bonuses: {
        Row: {
          awarded_at: string
          bonus_type: string
          created_at: string
          game_reference: string
          id: string
          used: boolean
          user_id: string
        }
        Insert: {
          awarded_at?: string
          bonus_type: string
          created_at?: string
          game_reference: string
          id?: string
          used?: boolean
          user_id: string
        }
        Update: {
          awarded_at?: string
          bonus_type?: string
          created_at?: string
          game_reference?: string
          id?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_buzz_counter: {
        Row: {
          buzz_count: number
          date: string
          id: string
          user_id: string
          week_map_generations: number[] | null
        }
        Insert: {
          buzz_count?: number
          date?: string
          id?: string
          user_id: string
          week_map_generations?: number[] | null
        }
        Update: {
          buzz_count?: number
          date?: string
          id?: string
          user_id?: string
          week_map_generations?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_buzz_counter_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_buzz_map: {
        Row: {
          generated_at: string | null
          id: string
          lat: number
          lng: number
          radius_km: number
          user_id: string
          week: number
        }
        Insert: {
          generated_at?: string | null
          id?: string
          lat: number
          lng: number
          radius_km: number
          user_id: string
          week: number
        }
        Update: {
          generated_at?: string | null
          id?: string
          lat?: number
          lng?: number
          radius_km?: number
          user_id?: string
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_buzz_map_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_buzz_map_counter: {
        Row: {
          buzz_map_count: number
          created_at: string
          date: string
          id: string
          user_id: string
          week_map_counts: number[] | null
        }
        Insert: {
          buzz_map_count?: number
          created_at?: string
          date?: string
          id?: string
          user_id: string
          week_map_counts?: number[] | null
        }
        Update: {
          buzz_map_count?: number
          created_at?: string
          date?: string
          id?: string
          user_id?: string
          week_map_counts?: number[] | null
        }
        Relationships: []
      }
      user_clue_lines: {
        Row: {
          clue_index: number
          clue_line: string
          created_at: string
          id: string
          is_released: boolean
          language_code: string
          plan_level: string
          prompt_id: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          clue_index: number
          clue_line: string
          created_at?: string
          id?: string
          is_released?: boolean
          language_code?: string
          plan_level?: string
          prompt_id: string
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          clue_index?: number
          clue_line?: string
          created_at?: string
          id?: string
          is_released?: boolean
          language_code?: string
          plan_level?: string
          prompt_id?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      user_clues: {
        Row: {
          buzz_cost: number
          clue_category: string | null
          clue_id: string
          clue_type: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          description_it: string
          is_misleading: boolean | null
          location_id: string | null
          prize_id: string | null
          title_en: string | null
          title_fr: string | null
          title_it: string
          user_id: string
          week_number: number | null
        }
        Insert: {
          buzz_cost: number
          clue_category?: string | null
          clue_id?: string
          clue_type?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_it: string
          is_misleading?: boolean | null
          location_id?: string | null
          prize_id?: string | null
          title_en?: string | null
          title_fr?: string | null
          title_it: string
          user_id: string
          week_number?: number | null
        }
        Update: {
          buzz_cost?: number
          clue_category?: string | null
          clue_id?: string
          clue_type?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_it?: string
          is_misleading?: boolean | null
          location_id?: string | null
          prize_id?: string | null
          title_en?: string | null
          title_fr?: string | null
          title_it?: string
          user_id?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_clues_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_clues_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_clues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          analytics_consent: boolean | null
          communications_consent: boolean | null
          cookie_consent: boolean | null
          created_at: string | null
          id: string
          marketing_consent: boolean | null
          profiling_consent: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analytics_consent?: boolean | null
          communications_consent?: boolean | null
          cookie_consent?: boolean | null
          created_at?: string | null
          id?: string
          marketing_consent?: boolean | null
          profiling_consent?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analytics_consent?: boolean | null
          communications_consent?: boolean | null
          cookie_consent?: boolean | null
          created_at?: string | null
          id?: string
          marketing_consent?: boolean | null
          profiling_consent?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_cookie_preferences: {
        Row: {
          analytics_cookies: boolean | null
          created_at: string | null
          essential_cookies: boolean | null
          id: string
          marketing_cookies: boolean | null
          preferences_cookies: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analytics_cookies?: boolean | null
          created_at?: string | null
          essential_cookies?: boolean | null
          id?: string
          marketing_cookies?: boolean | null
          preferences_cookies?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analytics_cookies?: boolean | null
          created_at?: string | null
          essential_cookies?: boolean | null
          id?: string
          marketing_cookies?: boolean | null
          preferences_cookies?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_map_areas: {
        Row: {
          clue_id: string | null
          created_at: string
          id: string
          lat: number
          lng: number
          radius_km: number
          user_id: string
          week: number
        }
        Insert: {
          clue_id?: string | null
          created_at?: string
          id?: string
          lat: number
          lng: number
          radius_km: number
          user_id: string
          week: number
        }
        Update: {
          clue_id?: string | null
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          radius_km?: number
          user_id?: string
          week?: number
        }
        Relationships: []
      }
      user_minigames_progress: {
        Row: {
          completed: boolean
          created_at: string
          game_key: string
          id: string
          last_played: string
          score: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          game_key: string
          id?: string
          last_played?: string
          score?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          game_key?: string
          id?: string
          last_played?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_mission_registrations: {
        Row: {
          created_at: string
          id: string
          mission_id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mission_id: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mission_id?: string
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_registrations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "monthly_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mission_status: {
        Row: {
          buzz_counter: number | null
          clues_found: number | null
          map_area_generated: boolean | null
          map_radius_km: number | null
          mission_days_remaining: number | null
          mission_days_total: number | null
          mission_progress_percent: number | null
          mission_started_at: string | null
          mission_status: string | null
          prize_city: string | null
          prize_coordinates: Json | null
          prize_name: string | null
          prize_street: string | null
          total_clues: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          buzz_counter?: number | null
          clues_found?: number | null
          map_area_generated?: boolean | null
          map_radius_km?: number | null
          mission_days_remaining?: number | null
          mission_days_total?: number | null
          mission_progress_percent?: number | null
          mission_started_at?: string | null
          mission_status?: string | null
          prize_city?: string | null
          prize_coordinates?: Json | null
          prize_name?: string | null
          prize_street?: string | null
          total_clues?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          buzz_counter?: number | null
          clues_found?: number | null
          map_area_generated?: boolean | null
          map_radius_km?: number | null
          mission_days_remaining?: number | null
          mission_days_total?: number | null
          mission_progress_percent?: number | null
          mission_started_at?: string | null
          mission_status?: string | null
          prize_city?: string | null
          prize_coordinates?: Json | null
          prize_name?: string | null
          prize_street?: string | null
          total_clues?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_read: boolean | null
          is_read_bool: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          is_read_bool?: boolean | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          is_read_bool?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          brand: string
          created_at: string
          exp_month: number
          exp_year: number
          id: string
          is_default: boolean
          last4: string
          stripe_pm_id: string
          user_id: string
        }
        Insert: {
          brand: string
          created_at?: string
          exp_month: number
          exp_year: number
          id?: string
          is_default?: boolean
          last4: string
          stripe_pm_id: string
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          exp_month?: number
          exp_year?: number
          id?: string
          is_default?: boolean
          last4?: string
          stripe_pm_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          cap: string | null
          citta: string | null
          city: string | null
          cognome: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          nome: string | null
          numero_civico: string | null
          surname: string | null
          via: string | null
        }
        Insert: {
          address?: string | null
          cap?: string | null
          citta?: string | null
          city?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          nome?: string | null
          numero_civico?: string | null
          surname?: string | null
          via?: string | null
        }
        Update: {
          address?: string | null
          cap?: string | null
          citta?: string | null
          city?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          nome?: string | null
          numero_civico?: string | null
          surname?: string | null
          via?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_used_clues: {
        Row: {
          clue_category: string
          custom_clue_text: string | null
          id: string
          prize_clue_id: string | null
          used_at: string | null
          user_id: string
          week_number: number
        }
        Insert: {
          clue_category: string
          custom_clue_text?: string | null
          id?: string
          prize_clue_id?: string | null
          used_at?: string | null
          user_id: string
          week_number: number
        }
        Update: {
          clue_category?: string
          custom_clue_text?: string | null
          id?: string
          prize_clue_id?: string | null
          used_at?: string | null
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      weekly_buzz_allowances: {
        Row: {
          created_at: string
          id: string
          max_buzz_count: number
          used_buzz_count: number
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          max_buzz_count: number
          used_buzz_count?: number
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          max_buzz_count?: number
          used_buzz_count?: number
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_referral_credits: {
        Args: { user_email: string; credits_to_add: number }
        Returns: undefined
      }
      assign_area_radius: {
        Args: { p_mission_id: string }
        Returns: number
      }
      block_ip: {
        Args: {
          ip_addr: unknown
          block_duration_minutes?: number
          block_reason?: string
        }
        Returns: undefined
      }
      calculate_buzz_price: {
        Args: { daily_count: number }
        Returns: number
      }
      calculate_direction: {
        Args: { lat1: number; lng1: number; lat2: number; lng2: number }
        Returns: string
      }
      calculate_distance_meters: {
        Args: { lat1: number; lng1: number; lat2: number; lng2: number }
        Returns: number
      }
      can_use_intelligence_tool: {
        Args: { p_user_id: string; p_mission_id: string; p_tool_name: string }
        Returns: boolean
      }
      can_user_use_buzz: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_abuse_limit: {
        Args: { p_event_type: string; p_user_id: string }
        Returns: boolean
      }
      check_daily_final_shot_limit: {
        Args: { p_user_id: string; p_mission_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          ip_addr: unknown
          api_endpoint: string
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_duplicate_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_old_abuse_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_security_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      consume_buzz_usage: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      execute_sql: {
        Args: { sql: string }
        Returns: undefined
      }
      force_subscription_sync: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      force_user_to_base_tier: {
        Args: { p_user_id: string }
        Returns: Json
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_subscription: {
        Args: { p_user_id: string }
        Returns: {
          tier: string
          status: string
          expires_at: string
        }[]
      }
      get_authenticated_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_mission_week: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_profile_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          role: string
          email: string
        }[]
      }
      get_current_week_and_year: {
        Args: Record<PropertyKey, never>
        Returns: {
          week_num: number
          year_num: number
        }[]
      }
      get_legal_document: {
        Args: { document_type: string }
        Returns: {
          id: string
          type: string
          title: string
          version: string
          content_md: string
          is_active: boolean
          published_at: string
          created_at: string
        }[]
      }
      get_map_radius_km: {
        Args: { p_week: number; p_generation_count: number }
        Returns: number
      }
      get_max_map_generations: {
        Args: { p_week: number }
        Returns: number
      }
      get_my_agent_code: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_code: string
        }[]
      }
      get_user_by_email: {
        Args: { email_param: string }
        Returns: unknown[]
      }
      get_user_role_safe: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_roles: {
        Args: { user_id: string }
        Returns: {
          role: string
        }[]
      }
      handle_new_user: {
        Args: { new_user_id: string; user_email: string }
        Returns: undefined
      }
      has_role: {
        Args: { user_id: string; role_name: string }
        Returns: boolean
      }
      has_user_played_spin_today: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      increment_buzz_counter: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_buzz_map_counter: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_daily_final_shot_counter: {
        Args: { p_user_id: string; p_mission_id: string }
        Returns: undefined
      }
      increment_map_generation_counter: {
        Args: { p_user_id: string; p_week: number }
        Returns: number
      }
      is_admin_email_safe: {
        Args: { p_email: string }
        Returns: boolean
      }
      is_ip_blocked: {
        Args: { ip_addr: unknown }
        Returns: boolean
      }
      log_potential_abuse: {
        Args: { p_event_type: string; p_user_id: string }
        Returns: boolean
      }
      process_stripe_webhook_completed: {
        Args: {
          p_session_id: string
          p_stripe_customer_id: string
          p_payment_status: string
          p_amount_total: number
        }
        Returns: boolean
      }
      record_intelligence_tool_usage: {
        Args: { p_user_id: string; p_mission_id: string; p_tool_name: string }
        Returns: boolean
      }
      register_user_to_active_mission: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      release_clue_lines: {
        Args: { p_user_id: string; p_plan_level: string; p_week_number: number }
        Returns: number
      }
      reset_user_mission: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      reset_user_mission_full: {
        Args: { user_id_input: string }
        Returns: Json
      }
      setup_developer_user: {
        Args: { uid: string }
        Returns: undefined
      }
      submit_final_shot: {
        Args: { p_mission_id: string; p_latitude: number; p_longitude: number }
        Returns: Json
      }
      update_user_subscription_tier: {
        Args: { target_user_id: string; new_tier: string }
        Returns: undefined
      }
      validate_buzz_user_id: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      validate_progressive_pricing: {
        Args: {
          p_user_id: string
          p_price: number
          p_radius: number
          p_generation: number
        }
        Returns: boolean
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
