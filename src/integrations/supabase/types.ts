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
      admin_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
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
      app_config: {
        Row: {
          key: string
          updated_at: string | null
          value_int: number | null
          value_text: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value_int?: number | null
          value_text?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value_int?: number | null
          value_text?: string | null
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
      apple_push_config: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          key_id: string
          private_key: string
          team_id: string
          updated_at: string
        }
        Insert: {
          bundle_id?: string
          created_at?: string
          id?: string
          key_id: string
          private_key: string
          team_id: string
          updated_at?: string
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          key_id?: string
          private_key?: string
          team_id?: string
          updated_at?: string
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
      badges: {
        Row: {
          badge_id: string
          created_at: string | null
          description: string | null
          icon: string | null
          name: string
        }
        Insert: {
          badge_id?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          name: string
        }
        Update: {
          badge_id?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          name?: string
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
      buzz_grants: {
        Row: {
          created_at: string | null
          id: string
          remaining: number
          source: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          remaining: number
          source: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          remaining?: number
          source?: string
          updated_at?: string | null
          user_id?: string
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
      category_tag_map: {
        Row: {
          category: string
          created_at: string | null
          tags: string[]
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          tags: string[]
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          tags?: string[]
          updated_at?: string | null
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
          device_info: Json | null
          device_type: string
          id: string
          is_active: boolean | null
          last_used: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          device_type: string
          id?: string
          is_active?: boolean | null
          last_used?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          device_type?: string
          id?: string
          is_active?: boolean | null
          last_used?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      event_tickets: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          source: string
          ticket_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          source: string
          ticket_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          source?: string
          ticket_type?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          event_id: string
          name: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string
          name: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string
          name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      external_feed_items: {
        Row: {
          brand: string | null
          content_hash: string
          created_at: string
          id: string
          locale: string | null
          published_at: string
          score: number | null
          source: string
          summary: string | null
          tags: string[] | null
          title: string
          url: string
        }
        Insert: {
          brand?: string | null
          content_hash: string
          created_at?: string
          id?: string
          locale?: string | null
          published_at: string
          score?: number | null
          source: string
          summary?: string | null
          tags?: string[] | null
          title: string
          url: string
        }
        Update: {
          brand?: string | null
          content_hash?: string
          created_at?: string
          id?: string
          locale?: string | null
          published_at?: string
          score?: number | null
          source?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      external_feed_sources: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          keywords: string[] | null
          kind: string
          locale: string
          tags: string[] | null
          updated_at: string | null
          url: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id: string
          keywords?: string[] | null
          kind: string
          locale: string
          tags?: string[] | null
          updated_at?: string | null
          url: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          keywords?: string[] | null
          kind?: string
          locale?: string
          tags?: string[] | null
          updated_at?: string | null
          url?: string
          weight?: number | null
        }
        Relationships: []
      }
      fcm_subscriptions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          is_active: boolean | null
          platform: string | null
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string | null
          fid: string
          id: string
          ip: unknown | null
          token: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fid: string
          id?: string
          ip?: unknown | null
          token: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fid?: string
          id?: string
          ip?: unknown | null
          token?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feed_crawler_runs: {
        Row: {
          created_at: string | null
          error_details: Json | null
          finished_at: string | null
          id: string
          items_fetched: number | null
          items_new: number | null
          items_skipped: number | null
          sources_count: number | null
          started_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          finished_at?: string | null
          id?: string
          items_fetched?: number | null
          items_new?: number | null
          items_skipped?: number | null
          sources_count?: number | null
          started_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          finished_at?: string | null
          id?: string
          items_fetched?: number | null
          items_new?: number | null
          items_skipped?: number | null
          sources_count?: number | null
          started_at?: string | null
        }
        Relationships: []
      }
      feed_scoring_stats: {
        Row: {
          average_score: number | null
          created_at: string | null
          discard_reasons: Json | null
          id: string
          run_timestamp: string | null
          scoring_mode: string | null
          total_processed: number | null
        }
        Insert: {
          average_score?: number | null
          created_at?: string | null
          discard_reasons?: Json | null
          id?: string
          run_timestamp?: string | null
          scoring_mode?: string | null
          total_processed?: number | null
        }
        Update: {
          average_score?: number | null
          created_at?: string | null
          discard_reasons?: Json | null
          id?: string
          run_timestamp?: string | null
          scoring_mode?: string | null
          total_processed?: number | null
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
      idempotency_keys: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          key: string
          request_hash: string
          response_data: Json | null
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          key: string
          request_hash: string
          response_data?: Json | null
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          key?: string
          request_hash?: string
          response_data?: Json | null
          status_code?: number | null
          user_id?: string | null
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
      interest_signals: {
        Row: {
          category: string | null
          device: string | null
          id: string
          keywords: string[] | null
          meta: Json | null
          section: string | null
          session_id: string
          ts: string
          type: string
          user_id: string
        }
        Insert: {
          category?: string | null
          device?: string | null
          id?: string
          keywords?: string[] | null
          meta?: Json | null
          section?: string | null
          session_id: string
          ts?: string
          type: string
          user_id: string
        }
        Update: {
          category?: string | null
          device?: string | null
          id?: string
          keywords?: string[] | null
          meta?: Json | null
          section?: string | null
          session_id?: string
          ts?: string
          type?: string
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
      map_notes: {
        Row: {
          created_at: string
          id: string
          importance: string
          marker_id: string | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          importance?: string
          marker_id?: string | null
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          importance?: string
          marker_id?: string | null
          text?: string
          updated_at?: string
          user_id?: string
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
      marker_claims: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          id: string
          marker_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          marker_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          marker_id?: string
          user_id?: string
        }
        Relationships: []
      }
      marker_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          marker_id: string
          payload: Json
          reward_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          marker_id: string
          payload: Json
          reward_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          marker_id?: string
          payload?: Json
          reward_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      markers: {
        Row: {
          active: boolean
          created_at: string | null
          id: string
          lat: number
          lng: number
          title: string
          updated_at: string | null
          visible_from: string | null
          visible_to: string | null
          zoom_max: number | null
          zoom_min: number | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          id?: string
          lat: number
          lng: number
          title: string
          updated_at?: string | null
          visible_from?: string | null
          visible_to?: string | null
          zoom_max?: number | null
          zoom_min?: number | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: string
          lat?: number
          lng?: number
          title?: string
          updated_at?: string | null
          visible_from?: string | null
          visible_to?: string | null
          zoom_max?: number | null
          zoom_min?: number | null
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
      notification_counters: {
        Row: {
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          category: string
          created_at: string | null
          enabled: boolean
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          enabled?: boolean
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          enabled?: boolean
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_quota: {
        Row: {
          last_reset: string
          sent_today: number
          user_id: string
        }
        Insert: {
          last_reset?: string
          sent_today?: number
          user_id: string
        }
        Update: {
          last_reset?: string
          sent_today?: number
          user_id?: string
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
      personality_quiz_results: {
        Row: {
          assigned_description: string
          assigned_type: string
          completed_at: string
          id: string
          quiz_answers: Json
          user_id: string
        }
        Insert: {
          assigned_description: string
          assigned_type: string
          completed_at?: string
          id?: string
          quiz_answers: Json
          user_id: string
        }
        Update: {
          assigned_description?: string
          assigned_type?: string
          completed_at?: string
          id?: string
          quiz_answers?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personality_quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_registered_users: {
        Row: {
          agent_code: string | null
          created_at: string
          email: string
          id: string
          is_pre_registered: boolean
          is_verified: boolean | null
          name: string | null
          password_hash: string | null
        }
        Insert: {
          agent_code?: string | null
          created_at?: string
          email: string
          id?: string
          is_pre_registered?: boolean
          is_verified?: boolean | null
          name?: string | null
          password_hash?: string | null
        }
        Update: {
          agent_code?: string | null
          created_at?: string
          email?: string
          id?: string
          is_pre_registered?: boolean
          is_verified?: boolean | null
          name?: string | null
          password_hash?: string | null
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
          access_enabled: boolean | null
          access_start_date: string | null
          access_starts_at: string | null
          address: string | null
          agent_code: string | null
          agent_title: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          can_access_app: boolean | null
          city: string | null
          country: string | null
          created_at: string
          credits: number | null
          device_token: string | null
          early_access_hours: number | null
          email: string | null
          first_login_completed: boolean | null
          first_name: string | null
          full_name: string | null
          id: string
          investigative_style: string | null
          is_admin: boolean
          is_pre_registered: boolean | null
          language: string | null
          last_cookie_banner_shown: string | null
          last_name: string | null
          last_plan_change: string | null
          notifications_enabled: boolean | null
          phone: string | null
          plan: string | null
          postal_code: string | null
          pre_registration_date: string | null
          preferred_language: string | null
          preferred_rewards: string[] | null
          push_notifications_enabled: boolean | null
          recovery_key: string | null
          referral_code: string | null
          role: string
          status: string | null
          stripe_customer_id: string | null
          subscription_end: string | null
          subscription_plan: string | null
          subscription_start: string | null
          subscription_tier: string
          tier: string | null
          updated_at: string
          username: string | null
          weekly_hints: string | null
        }
        Insert: {
          access_enabled?: boolean | null
          access_start_date?: string | null
          access_starts_at?: string | null
          address?: string | null
          agent_code?: string | null
          agent_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          can_access_app?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number | null
          device_token?: string | null
          early_access_hours?: number | null
          email?: string | null
          first_login_completed?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id: string
          investigative_style?: string | null
          is_admin?: boolean
          is_pre_registered?: boolean | null
          language?: string | null
          last_cookie_banner_shown?: string | null
          last_name?: string | null
          last_plan_change?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          pre_registration_date?: string | null
          preferred_language?: string | null
          preferred_rewards?: string[] | null
          push_notifications_enabled?: boolean | null
          recovery_key?: string | null
          referral_code?: string | null
          role?: string
          status?: string | null
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_start?: string | null
          subscription_tier?: string
          tier?: string | null
          updated_at?: string
          username?: string | null
          weekly_hints?: string | null
        }
        Update: {
          access_enabled?: boolean | null
          access_start_date?: string | null
          access_starts_at?: string | null
          address?: string | null
          agent_code?: string | null
          agent_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          can_access_app?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number | null
          device_token?: string | null
          early_access_hours?: number | null
          email?: string | null
          first_login_completed?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          investigative_style?: string | null
          is_admin?: boolean
          is_pre_registered?: boolean | null
          language?: string | null
          last_cookie_banner_shown?: string | null
          last_name?: string | null
          last_plan_change?: string | null
          notifications_enabled?: boolean | null
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          pre_registration_date?: string | null
          preferred_language?: string | null
          preferred_rewards?: string[] | null
          push_notifications_enabled?: boolean | null
          recovery_key?: string | null
          referral_code?: string | null
          role?: string
          status?: string | null
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_start?: string | null
          subscription_tier?: string
          tier?: string | null
          updated_at?: string
          username?: string | null
          weekly_hints?: string | null
        }
        Relationships: []
      }
      push_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      push_notification_logs: {
        Row: {
          apns_failed: number | null
          apns_sent: number | null
          created_at: string | null
          devices_sent: number | null
          devices_targeted: number | null
          error_message: string | null
          fcm_failed: number | null
          fcm_sent: number | null
          id: string
          message: string
          metadata: Json | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          success: boolean | null
          target_type: string
          target_user_id: string | null
          title: string
        }
        Insert: {
          apns_failed?: number | null
          apns_sent?: number | null
          created_at?: string | null
          devices_sent?: number | null
          devices_targeted?: number | null
          error_message?: string | null
          fcm_failed?: number | null
          fcm_sent?: number | null
          id?: string
          message: string
          metadata?: Json | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          success?: boolean | null
          target_type: string
          target_user_id?: string | null
          title: string
        }
        Update: {
          apns_failed?: number | null
          apns_sent?: number | null
          created_at?: string | null
          devices_sent?: number | null
          devices_targeted?: number | null
          error_message?: string | null
          fcm_failed?: number | null
          fcm_sent?: number | null
          id?: string
          message?: string
          metadata?: Json | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          success?: boolean | null
          target_type?: string
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      push_notifications_log: {
        Row: {
          created_at: string
          device_info: Json | null
          error_message: string | null
          event_type: string
          id: string
          platform: string | null
          success: boolean | null
          token: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          error_message?: string | null
          event_type: string
          id?: string
          platform?: string | null
          success?: boolean | null
          token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          error_message?: string | null
          event_type?: string
          id?: string
          platform?: string | null
          success?: boolean | null
          token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          app_version: string | null
          auth: string
          client: string | null
          created_at: string
          device_info: Json | null
          endpoint: string
          endpoint_type: string | null
          keys: Json | null
          last_seen_at: string | null
          p256dh: string
          platform: string | null
          ua: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          auth: string
          client?: string | null
          created_at?: string
          device_info?: Json | null
          endpoint: string
          endpoint_type?: string | null
          keys?: Json | null
          last_seen_at?: string | null
          p256dh: string
          platform?: string | null
          ua?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          auth?: string
          client?: string | null
          created_at?: string
          device_info?: Json | null
          endpoint?: string
          endpoint_type?: string | null
          keys?: Json | null
          last_seen_at?: string | null
          p256dh?: string
          platform?: string | null
          ua?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          auth: string | null
          created_at: string | null
          device_info: Json | null
          endpoint: string | null
          endpoint_type: string | null
          last_used_at: string | null
          p256dh: string | null
          platform: string | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth?: string | null
          created_at?: string | null
          device_info?: Json | null
          endpoint?: string | null
          endpoint_type?: string | null
          last_used_at?: string | null
          p256dh?: string | null
          platform?: string | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string | null
          created_at?: string | null
          device_info?: Json | null
          endpoint?: string | null
          endpoint_type?: string | null
          last_used_at?: string | null
          p256dh?: string | null
          platform?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      qr_buzz_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_used: boolean
          lat: number
          lng: number
          location_name: string
          reward_content: Json | null
          reward_type: string
          usage_attempts: number | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          lat: number
          lng: number
          location_name: string
          reward_content?: Json | null
          reward_type: string
          usage_attempts?: number | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          lat?: number
          lng?: number
          location_name?: string
          reward_content?: Json | null
          reward_type?: string
          usage_attempts?: number | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      qr_code_claims: {
        Row: {
          claimed_at: string
          id: string
          qr_code_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          qr_code_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          qr_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_claims_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_code_discoveries: {
        Row: {
          discovered_at: string
          id: string
          qr_code_id: string
          user_id: string
        }
        Insert: {
          discovered_at?: string
          id?: string
          qr_code_id: string
          user_id: string
        }
        Update: {
          discovered_at?: string
          id?: string
          qr_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_discoveries_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_code_links: {
        Row: {
          code: string
          created_at: string
          marker_id: string
        }
        Insert: {
          code: string
          created_at?: string
          marker_id: string
        }
        Update: {
          code?: string
          created_at?: string
          marker_id?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          center_lat: number | null
          center_lon: number | null
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          is_hidden: boolean
          lat: number | null
          lng: number | null
          max_uses_per_user: number | null
          max_uses_total: number | null
          message: string | null
          radius_m: number | null
          reward_type: string | null
          reward_value: string | null
          status: string
          title: string
          type: string | null
        }
        Insert: {
          center_lat?: number | null
          center_lon?: number | null
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_hidden?: boolean
          lat?: number | null
          lng?: number | null
          max_uses_per_user?: number | null
          max_uses_total?: number | null
          message?: string | null
          radius_m?: number | null
          reward_type?: string | null
          reward_value?: string | null
          status?: string
          title: string
          type?: string | null
        }
        Update: {
          center_lat?: number | null
          center_lon?: number | null
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_hidden?: boolean
          lat?: number | null
          lng?: number | null
          max_uses_per_user?: number | null
          max_uses_total?: number | null
          message?: string | null
          radius_m?: number | null
          reward_type?: string | null
          reward_value?: string | null
          status?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      qr_redemption_logs: {
        Row: {
          created_at: string
          distance_meters: number | null
          failure_reason: string | null
          id: string
          qr_code: string | null
          reward_granted: Json | null
          success: boolean
          user_id: string
          user_lat: number | null
          user_lng: number | null
        }
        Insert: {
          created_at: string
          distance_meters?: number | null
          failure_reason?: string | null
          id?: string
          qr_code?: string | null
          reward_granted?: Json | null
          success: boolean
          user_id: string
          user_lat?: number | null
          user_lng?: number | null
        }
        Update: {
          created_at?: string
          distance_meters?: number | null
          failure_reason?: string | null
          id?: string
          qr_code?: string | null
          reward_granted?: Json | null
          success?: boolean
          user_id?: string
          user_lat?: number | null
          user_lng?: number | null
        }
        Relationships: []
      }
      qr_redemptions: {
        Row: {
          code: string
          id: string
          lat: number | null
          lon: number | null
          redeemed_at: string
          reward_type: string | null
          reward_value: string | null
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          lat?: number | null
          lon?: number | null
          redeemed_at?: string
          reward_type?: string | null
          reward_value?: string | null
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          lat?: number | null
          lon?: number | null
          redeemed_at?: string
          reward_type?: string | null
          reward_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_redemptions_code_fk"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      qr_rewards: {
        Row: {
          attivo: boolean
          created_at: string
          creato_da: string | null
          expires_at: string | null
          id: string
          lat: number
          location_name: string
          lon: number
          max_distance_meters: number
          message: string
          redeemed_by: string[] | null
          reward_type: string
          scansioni: number
          updated_at: string
        }
        Insert: {
          attivo?: boolean
          created_at?: string
          creato_da?: string | null
          expires_at?: string | null
          id?: string
          lat: number
          location_name: string
          lon: number
          max_distance_meters?: number
          message?: string
          redeemed_by?: string[] | null
          reward_type: string
          scansioni?: number
          updated_at?: string
        }
        Update: {
          attivo?: boolean
          created_at?: string
          creato_da?: string | null
          expires_at?: string | null
          id?: string
          lat?: number
          location_name?: string
          lon?: number
          max_distance_meters?: number
          message?: string
          redeemed_by?: string[] | null
          reward_type?: string
          scansioni?: number
          updated_at?: string
        }
        Relationships: []
      }
      role_change_audit: {
        Row: {
          changed_at: string | null
          changed_by: string
          id: string
          new_role: string
          old_role: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          id?: string
          new_role: string
          old_role?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          id?: string
          new_role?: string
          old_role?: string | null
          reason?: string | null
          user_id?: string
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
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          processed_at?: string
          stripe_event_id?: string
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
      suggested_notifications: {
        Row: {
          created_at: string
          dedupe_key: string
          id: string
          item_id: string | null
          reason: string
          score: number
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dedupe_key: string
          id?: string
          item_id?: string | null
          reason: string
          score: number
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dedupe_key?: string
          id?: string
          item_id?: string | null
          reason?: string
          score?: number
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggested_notifications_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "external_feed_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string | null
          id: string
          source: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string | null
          id?: string
          source: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string | null
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          buzz_credit: number
          buzz_map_credit: number
          user_id: string
        }
        Insert: {
          buzz_credit?: number
          buzz_map_credit?: number
          user_id: string
        }
        Update: {
          buzz_credit?: number
          buzz_map_credit?: number
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
          terms_accepted: boolean | null
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
          terms_accepted?: boolean | null
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
          terms_accepted?: boolean | null
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
      user_credits: {
        Row: {
          free_buzz_credit: number
          free_buzz_map_credit: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          free_buzz_credit?: number
          free_buzz_map_credit?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          free_buzz_credit?: number
          free_buzz_map_credit?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_custom_rewards: {
        Row: {
          code: string
          created_at: string
          id: string
          reward_value: number | null
          title: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          reward_value?: number | null
          title?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          reward_value?: number | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interest_profile: {
        Row: {
          topics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          topics?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          topics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
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
          metadata: Json | null
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
          metadata?: Json | null
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
          metadata?: Json | null
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
      user_payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          last4: string | null
          payment_method_brand: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          last4?: string | null
          payment_method_brand?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          last4?: string | null
          payment_method_brand?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          id: string
          permission_type: string
          permission_value: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          permission_type: string
          permission_value?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          permission_type?: string
          permission_value?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_plan_events: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          old_plan: string | null
          plan: string
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          old_plan?: string | null
          plan: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          old_plan?: string | null
          plan?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
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
          is_admin: boolean
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
          is_admin?: boolean
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
          is_admin?: boolean
          name?: string | null
          nome?: string | null
          numero_civico?: string | null
          surname?: string | null
          via?: string | null
        }
        Relationships: []
      }
      user_push_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          fcm_token: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          fcm_token: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          fcm_token?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          invitee_id: string
          inviter_id: string
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string
          xp_awarded: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
          xp_awarded?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
          xp_awarded?: boolean
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          id: string
          marker_id: string
          payload: Json | null
          reward_type: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          marker_id: string
          payload?: Json | null
          reward_type: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          marker_id?: string
          payload?: Json | null
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_marker_id_fkey"
            columns: ["marker_id"]
            isOneToOne: false
            referencedRelation: "markers"
            referencedColumns: ["id"]
          },
        ]
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
      user_weekly_buzz_limits: {
        Row: {
          buzz_map_count: number
          created_at: string | null
          id: string
          last_buzz_at: string | null
          max_buzz_map_allowed: number
          next_reset_at: string
          updated_at: string | null
          user_id: string
          week_number: number
          week_start_date: string
        }
        Insert: {
          buzz_map_count?: number
          created_at?: string | null
          id?: string
          last_buzz_at?: string | null
          max_buzz_map_allowed?: number
          next_reset_at: string
          updated_at?: string | null
          user_id: string
          week_number: number
          week_start_date: string
        }
        Update: {
          buzz_map_count?: number
          created_at?: string | null
          id?: string
          last_buzz_at?: string | null
          max_buzz_map_allowed?: number
          next_reset_at?: string
          updated_at?: string | null
          user_id?: string
          week_number?: number
          week_start_date?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          buzz_xp_progress: number | null
          id: string
          map_xp_progress: number | null
          total_xp: number
          updated_at: string
          user_id: string
          xp_since_reward: number
        }
        Insert: {
          buzz_xp_progress?: number | null
          id?: string
          map_xp_progress?: number | null
          total_xp?: number
          updated_at?: string
          user_id: string
          xp_since_reward?: number
        }
        Update: {
          buzz_xp_progress?: number | null
          id?: string
          map_xp_progress?: number | null
          total_xp?: number
          updated_at?: string
          user_id?: string
          xp_since_reward?: number
        }
        Relationships: []
      }
      webpush_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh: string
          platform: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh: string
          platform?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh?: string
          platform?: string | null
          user_id?: string
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
      buzz_map_markers: {
        Row: {
          active: boolean | null
          id: string | null
          latitude: number | null
          longitude: number | null
          title: string | null
        }
        Insert: {
          active?: never
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          title?: string | null
        }
        Update: {
          active?: never
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          title?: string | null
        }
        Relationships: []
      }
      geo_push_delivery_state_v: {
        Row: {
          enter_count: number | null
          last_enter_at: string | null
          last_sent_at: string | null
          marker_id: string | null
          sent_count: number | null
          user_id: string | null
        }
        Insert: {
          enter_count?: number | null
          last_enter_at?: string | null
          last_sent_at?: string | null
          marker_id?: string | null
          sent_count?: number | null
          user_id?: string | null
        }
        Update: {
          enter_count?: number | null
          last_enter_at?: string | null
          last_sent_at?: string | null
          marker_id?: string | null
          sent_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      geo_push_markers_v: {
        Row: {
          id: string | null
          lat: number | null
          lng: number | null
          title: string | null
        }
        Relationships: []
      }
      geo_push_positions_v: {
        Row: {
          lat: number | null
          lng: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          lat?: number | null
          lng?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          lat?: number | null
          lng?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      geo_push_settings_v: {
        Row: {
          key: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          key?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          key?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      v_latest_webpush_subscription: {
        Row: {
          created_at: string | null
          endpoint: string | null
          sub_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_pref_users: {
        Row: {
          user_id: string | null
        }
        Relationships: []
      }
      v_user_resolved_tags: {
        Row: {
          active_categories: number | null
          resolved_tags: string[] | null
          user_id: string | null
        }
        Relationships: []
      }
      v_user_suggest_throttle: {
        Row: {
          last_sent_at: string | null
          total_sent: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _gen_unique_agent_code: {
        Args: { len?: number }
        Returns: string
      }
      _upsert_premium_feed_source: {
        Args: {
          p_enabled: boolean
          p_id: string
          p_keywords: string[]
          p_kind: string
          p_locale: string
          p_tags: string[]
          p_url: string
          p_weight: number
        }
        Returns: undefined
      }
      add_referral_credits: {
        Args: { credits_to_add: number; user_email: string }
        Returns: undefined
      }
      assign_area_radius: {
        Args: { p_mission_id: string }
        Returns: number
      }
      award_xp: {
        Args:
          | { p_user_id: string; p_xp_amount: number }
          | { p_user_id: string; p_xp_amount: number; p_xp_type?: string }
        Returns: Json
      }
      block_ip: {
        Args: {
          block_duration_minutes?: number
          block_reason?: string
          ip_addr: unknown
        }
        Returns: undefined
      }
      calculate_access_start_date: {
        Args: { plan_name: string }
        Returns: string
      }
      calculate_access_start_time: {
        Args: { p_plan: string }
        Returns: string
      }
      calculate_buzz_price: {
        Args: { daily_count: number }
        Returns: number
      }
      calculate_direction: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: string
      }
      calculate_distance_meters: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      calculate_qr_distance: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      can_use_intelligence_tool: {
        Args: { p_mission_id: string; p_tool_name: string; p_user_id: string }
        Returns: boolean
      }
      can_user_access_mission: {
        Args: { user_id: string }
        Returns: boolean
      }
      can_user_buzz_mappa: {
        Args: { p_user_id: string }
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
        Args: { p_mission_id: string; p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          api_endpoint: string
          ip_addr: unknown
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      check_security_rate_limit: {
        Args: { p_action: string; p_limit?: number; p_window_minutes?: number }
        Returns: boolean
      }
      cleanup_duplicate_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_expired_idempotency_keys: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_abuse_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_security_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      consume_buzz_mappa: {
        Args: { p_user_id: string }
        Returns: Json
      }
      consume_buzz_usage: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      consume_credit: {
        Args: { p_credit_type: string; p_user_id: string }
        Returns: boolean
      }
      count_distinct_push_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      count_push_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      count_push_tokens_since: {
        Args: { since: string }
        Returns: number
      }
      create_free_subscription: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      exec_sql: {
        Args: { sql: string }
        Returns: Json
      }
      fn_candidates_for_user: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          feed_item_id: string
          locale: string
          published_at: string
          score: number
          tags: string[]
          title: string
          url: string
        }[]
      }
      force_subscription_sync: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      force_user_to_base_tier: {
        Args: { p_user_id: string }
        Returns: Json
      }
      generate_agent_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_qr_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_agent_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      geo_push_log_delivery: {
        Args: {
          p_body: string
          p_distance_m: number
          p_marker_id: string
          p_payload: Json
          p_provider: string
          p_reason: string
          p_response: Json
          p_sent: boolean
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      geo_push_touch_watermark: {
        Args: { p_name: string; p_ts: string }
        Returns: undefined
      }
      geo_push_upsert_state: {
        Args: {
          p_enter_inc: number
          p_last_enter_at: string
          p_last_sent_at: string
          p_marker_id: string
          p_sent_inc: number
          p_user_id: string
        }
        Returns: undefined
      }
      get_active_subscription: {
        Args: { p_user_id: string }
        Returns: {
          expires_at: string
          status: string
          tier: string
        }[]
      }
      get_authenticated_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_game_week: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_mission_week: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_profile_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          role: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
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
          content_md: string
          created_at: string
          id: string
          is_active: boolean
          published_at: string
          title: string
          type: string
          version: string
        }[]
      }
      get_map_radius_km: {
        Args: { p_generation_count: number; p_week: number }
        Returns: number
      }
      get_max_buzz_for_week: {
        Args: { week_num: number }
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
      get_my_balance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_unread_count: {
        Args: { p_user_id?: string }
        Returns: number
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
      get_user_sync_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_weekly_buzz_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_xp_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_week_start_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      grant_buzz: {
        Args: { p_count: number; p_source: string; p_user: string }
        Returns: undefined
      }
      handle_new_user: {
        Args: { new_user_id: string; user_email: string }
        Returns: undefined
      }
      has_admin_role_secure: {
        Args: Record<PropertyKey, never> | { user_id_param: string }
        Returns: boolean
      }
      has_mission_started: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
      has_user_played_spin_today: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      haversine_m: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
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
        Args: { p_mission_id: string; p_user_id: string }
        Returns: undefined
      }
      increment_map_generation_counter: {
        Args: { p_user_id: string; p_week: number }
        Returns: number
      }
      increment_xp: {
        Args: { p_amount: number; p_user: string }
        Returns: undefined
      }
      interest_track: {
        Args: { payload: Json }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin_email_safe: {
        Args: { p_email: string }
        Returns: boolean
      }
      is_admin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_ip_blocked: {
        Args: { ip_addr: unknown }
        Returns: boolean
      }
      list_my_redemptions: {
        Args: { limit_rows?: number; offset_rows?: number }
        Returns: {
          code: string
          id: string
          lat: number | null
          lon: number | null
          redeemed_at: string
          reward_type: string | null
          reward_value: string | null
          user_id: string
        }[]
      }
      log_potential_abuse: {
        Args: { p_event_type: string; p_user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args:
          | {
              event_data_param?: Json
              event_type_param: string
              severity_param?: string
              user_id_param?: string
            }
          | { p_event_data?: Json; p_event_type: string }
        Returns: string
      }
      log_user_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      normalize_feed_url: {
        Args: { input_url: string }
        Returns: string
      }
      perform_security_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_stripe_webhook_completed: {
        Args: {
          p_amount_total: number
          p_payment_status: string
          p_session_id: string
          p_stripe_customer_id: string
        }
        Returns: boolean
      }
      qr_admin_upsert: {
        Args: {
          p_center_lat?: number
          p_center_lon?: number
          p_code: string
          p_days_valid?: number
          p_is_active?: boolean
          p_max_per_user?: number
          p_max_total?: number
          p_radius_m?: number
          p_reward_type: string
          p_reward_value: number
          p_title: string
        }
        Returns: Json
      }
      qr_redeem: {
        Args: { p_code: string; p_lat?: number; p_lon?: number }
        Returns: Json
      }
      record_intelligence_tool_usage: {
        Args: { p_mission_id: string; p_tool_name: string; p_user_id: string }
        Returns: boolean
      }
      redeem_qr: {
        Args: { code_input: string }
        Returns: Json
      }
      register_user_to_active_mission: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      release_clue_lines: {
        Args: { p_plan_level: string; p_user_id: string; p_week_number: number }
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
      send_user_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_notification_type: string
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      setup_developer_user: {
        Args: { uid: string }
        Returns: undefined
      }
      submit_final_shot: {
        Args: { p_latitude: number; p_longitude: number; p_mission_id: string }
        Returns: Json
      }
      sync_user_permissions: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      trigger_mirror_push_harvest: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_personality_quiz_result: {
        Args: {
          p_assigned_description: string
          p_assigned_type: string
          p_quiz_answers: Json
          p_user_id: string
        }
        Returns: Json
      }
      update_user_plan_complete: {
        Args: {
          p_amount?: number
          p_event_type?: string
          p_new_plan: string
          p_old_plan?: string
          p_payment_intent_id?: string
          p_user_id: string
        }
        Returns: Json
      }
      update_user_subscription_tier: {
        Args: { new_tier: string; target_user_id: string }
        Returns: undefined
      }
      upsert_fcm_subscription: {
        Args: {
          p_device_info?: Json
          p_platform: string
          p_token: string
          p_user_id: string
        }
        Returns: Json
      }
      upsert_notification_counter: {
        Args: { p_delta: number; p_user_id: string }
        Returns: number
      }
      upsert_user_position: {
        Args: { lat: number; lng: number; uid: string }
        Returns: undefined
      }
      upsert_webpush_subscription: {
        Args: {
          p_auth: string
          p_endpoint: string
          p_p256dh: string
          p_platform?: string
          p_user_id: string
        }
        Returns: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh: string
          platform: string | null
          user_id: string
        }
      }
      validate_buzz_user_id: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      validate_progressive_pricing: {
        Args: {
          p_generation: number
          p_price: number
          p_radius: number
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
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
      referral_status: ["pending", "registered"],
    },
  },
} as const
