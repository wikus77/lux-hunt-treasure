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
      admin_buzz_overrides: {
        Row: {
          cooldown_disabled: boolean
          created_at: string
          expires_at: string | null
          free_quota: number
          free_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cooldown_disabled?: boolean
          created_at?: string
          expires_at?: string | null
          free_quota?: number
          free_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cooldown_disabled?: boolean
          created_at?: string
          expires_at?: string | null
          free_quota?: number
          free_used?: number
          updated_at?: string
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      agent_buzz_actions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          meta: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      agent_clues: {
        Row: {
          clue_id: string
          created_at: string | null
          id: string
          meta: Json | null
          user_id: string
        }
        Insert: {
          clue_id: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id: string
        }
        Update: {
          clue_id?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      agent_dna: {
        Row: {
          archetype: string | null
          audacia: number
          etica: number
          intuito: number
          mutated_at: string | null
          rischio: number
          updated_at: string
          user_id: string
          vibrazione: number
        }
        Insert: {
          archetype?: string | null
          audacia?: number
          etica?: number
          intuito?: number
          mutated_at?: string | null
          rischio?: number
          updated_at?: string
          user_id: string
          vibrazione?: number
        }
        Update: {
          archetype?: string | null
          audacia?: number
          etica?: number
          intuito?: number
          mutated_at?: string | null
          rischio?: number
          updated_at?: string
          user_id?: string
          vibrazione?: number
        }
        Relationships: []
      }
      agent_dna_events: {
        Row: {
          created_at: string
          delta: Json
          id: number
          note: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: Json
          id?: number
          note?: string | null
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: Json
          id?: number
          note?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_dna_visual: {
        Row: {
          created_at: string | null
          data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_finalshot_attempts: {
        Row: {
          coords: Json
          created_at: string | null
          id: string
          result: string | null
          user_id: string
        }
        Insert: {
          coords: Json
          created_at?: string | null
          id?: string
          result?: string | null
          user_id: string
        }
        Update: {
          coords?: Json
          created_at?: string | null
          id?: string
          result?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_missions: {
        Row: {
          id: string
          mission_id: string
          progress: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          mission_id: string
          progress?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          mission_id?: string
          progress?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_profiles: {
        Row: {
          agent_code: string
          created_at: string | null
          nickname: string | null
          streak_days: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_code: string
          created_at?: string | null
          nickname?: string | null
          streak_days?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_code?: string
          created_at?: string | null
          nickname?: string | null
          streak_days?: number
          updated_at?: string | null
          user_id?: string
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
          color: string
          created_at?: string | null
          description?: string | null
          id?: number
          name_en: string
          name_it: string
          pe_max?: number | null
          pe_min: number
          symbol: string
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
      ai_docs: {
        Row: {
          body: string | null
          body_md: string | null
          category: string | null
          content: string | null
          created_at: string | null
          description: string | null
          doc_type: string | null
          id: string
          locale: string | null
          metadata: Json | null
          path: string | null
          raw_text: string | null
          source: string | null
          tags: string[] | null
          text: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          body?: string | null
          body_md?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          doc_type?: string | null
          id?: string
          locale?: string | null
          metadata?: Json | null
          path?: string | null
          raw_text?: string | null
          source?: string | null
          tags?: string[] | null
          text?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          body?: string | null
          body_md?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          doc_type?: string | null
          id?: string
          locale?: string | null
          metadata?: Json | null
          path?: string | null
          raw_text?: string | null
          source?: string | null
          tags?: string[] | null
          text?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      ai_docs_embeddings: {
        Row: {
          chunk_idx: number
          chunk_text: string
          created_at: string | null
          doc_id: string | null
          embedding: string | null
          id: string
          model: string
        }
        Insert: {
          chunk_idx: number
          chunk_text: string
          created_at?: string | null
          doc_id?: string | null
          embedding?: string | null
          id?: string
          model?: string
        }
        Update: {
          chunk_idx?: number
          chunk_text?: string
          created_at?: string | null
          doc_id?: string | null
          embedding?: string | null
          id?: string
          model?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_docs_embeddings_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "ai_docs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      ai_memories_user: {
        Row: {
          consent_given: boolean | null
          created_at: string | null
          id: string
          memory_key: string
          memory_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consent_given?: boolean | null
          created_at?: string | null
          id?: string
          memory_key: string
          memory_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consent_given?: boolean | null
          created_at?: string | null
          id?: string
          memory_key?: string
          memory_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_sessions: {
        Row: {
          device: string | null
          id: string
          last_active_at: string | null
          locale: string | null
          session_data: Json | null
          started_at: string | null
          subscription_tier: string | null
          user_id: string
        }
        Insert: {
          device?: string | null
          id?: string
          last_active_at?: string | null
          locale?: string | null
          session_data?: Json | null
          started_at?: string | null
          subscription_tier?: string | null
          user_id: string
        }
        Update: {
          device?: string | null
          id?: string
          last_active_at?: string | null
          locale?: string | null
          session_data?: Json | null
          started_at?: string | null
          subscription_tier?: string | null
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
      auto_push_config: {
        Row: {
          created_at: string
          daily_max: number
          daily_min: number
          enabled: boolean
          id: string
          max_push_per_day: number | null
          quiet_end: string
          quiet_hours_end: number | null
          quiet_hours_start: number | null
          quiet_start: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_max?: number
          daily_min?: number
          enabled?: boolean
          id?: string
          max_push_per_day?: number | null
          quiet_end?: string
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          quiet_start?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_max?: number
          daily_min?: number
          enabled?: boolean
          id?: string
          max_push_per_day?: number | null
          quiet_end?: string
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          quiet_start?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      auto_push_log: {
        Row: {
          details: Json | null
          id: string
          sent_at: string | null
          sent_date: string | null
          status: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          details?: Json | null
          id?: string
          sent_at?: string | null
          sent_date?: string | null
          status?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          details?: Json | null
          id?: string
          sent_at?: string | null
          sent_date?: string | null
          status?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_push_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "auto_push_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_push_templates: {
        Row: {
          ab_key: string | null
          ab_variant: string | null
          body: string
          condition_sql: string | null
          created_at: string | null
          data_json: Json | null
          deeplink: string | null
          enabled: boolean
          freq_cap_user_per_day: number
          id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          segment: string | null
          title: string
          type: string
          weight: number
        }
        Insert: {
          ab_key?: string | null
          ab_variant?: string | null
          body: string
          condition_sql?: string | null
          created_at?: string | null
          data_json?: Json | null
          deeplink?: string | null
          enabled?: boolean
          freq_cap_user_per_day?: number
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          segment?: string | null
          title: string
          type: string
          weight?: number
        }
        Update: {
          ab_key?: string | null
          ab_variant?: string | null
          body?: string
          condition_sql?: string | null
          created_at?: string | null
          data_json?: Json | null
          deeplink?: string | null
          enabled?: boolean
          freq_cap_user_per_day?: number
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          segment?: string | null
          title?: string
          type?: string
          weight?: number
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
      battle_audit: {
        Row: {
          battle_id: string
          event_type: string
          id: string
          payload: Json
          timestamp: string
          user_id: string | null
        }
        Insert: {
          battle_id: string
          event_type: string
          id?: string
          payload?: Json
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          battle_id?: string
          event_type?: string
          id?: string
          payload?: Json
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_audit_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_energy_traces: {
        Row: {
          battle_id: string
          created_at: string
          end_lat: number
          end_lng: number
          expires_at: string
          id: string
          intensity: number
          start_lat: number
          start_lng: number
          winner_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          end_lat: number
          end_lng: number
          expires_at?: string
          id?: string
          intensity?: number
          start_lat: number
          start_lng: number
          winner_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          end_lat?: number
          end_lng?: number
          expires_at?: string
          id?: string
          intensity?: number
          start_lat?: number
          start_lng?: number
          winner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_energy_traces_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_ghost_mode: {
        Row: {
          consecutive_losses: number
          created_at: string
          ghost_mode_active: boolean
          ghost_until: string | null
          id: string
          last_loss_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consecutive_losses?: number
          created_at?: string
          ghost_mode_active?: boolean
          ghost_until?: string | null
          id?: string
          last_loss_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consecutive_losses?: number
          created_at?: string
          ghost_mode_active?: boolean
          ghost_until?: string | null
          id?: string
          last_loss_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      battle_participants: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          is_winner: boolean | null
          ping_ms: number | null
          reaction_ms: number | null
          role: string
          tap_timestamp: string | null
          user_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          is_winner?: boolean | null
          ping_ms?: number | null
          reaction_ms?: number | null
          role: string
          tap_timestamp?: string | null
          user_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          is_winner?: boolean | null
          ping_ms?: number | null
          reaction_ms?: number | null
          role?: string
          tap_timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_participants_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_transfers: {
        Row: {
          amount: number
          battle_id: string
          created_at: string
          from_user_id: string
          id: string
          metadata: Json | null
          to_user_id: string
          transfer_type: string
        }
        Insert: {
          amount: number
          battle_id: string
          created_at?: string
          from_user_id: string
          id?: string
          metadata?: Json | null
          to_user_id: string
          transfer_type: string
        }
        Update: {
          amount?: number
          battle_id?: string
          created_at?: string
          from_user_id?: string
          id?: string
          metadata?: Json | null
          to_user_id?: string
          transfer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_transfers_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      battles: {
        Row: {
          accepted_at: string | null
          arena_lat: number | null
          arena_lng: number | null
          arena_name: string | null
          countdown_start_at: string | null
          created_at: string
          creator_ghost_until: string | null
          creator_id: string
          creator_ping_ms: number | null
          creator_reaction_ms: number | null
          creator_tap_at: string | null
          expires_at: string
          flash_at: string | null
          id: string
          metadata: Json | null
          opponent_ghost_until: string | null
          opponent_id: string | null
          opponent_ping_ms: number | null
          opponent_reaction_ms: number | null
          opponent_tap_at: string | null
          resolved_at: string | null
          server_compensation_ms: number | null
          stake_amount: number
          stake_percentage: number
          stake_type: string
          status: string
          winner_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          arena_lat?: number | null
          arena_lng?: number | null
          arena_name?: string | null
          countdown_start_at?: string | null
          created_at?: string
          creator_ghost_until?: string | null
          creator_id: string
          creator_ping_ms?: number | null
          creator_reaction_ms?: number | null
          creator_tap_at?: string | null
          expires_at?: string
          flash_at?: string | null
          id?: string
          metadata?: Json | null
          opponent_ghost_until?: string | null
          opponent_id?: string | null
          opponent_ping_ms?: number | null
          opponent_reaction_ms?: number | null
          opponent_tap_at?: string | null
          resolved_at?: string | null
          server_compensation_ms?: number | null
          stake_amount: number
          stake_percentage: number
          stake_type: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          arena_lat?: number | null
          arena_lng?: number | null
          arena_name?: string | null
          countdown_start_at?: string | null
          created_at?: string
          creator_ghost_until?: string | null
          creator_id?: string
          creator_ping_ms?: number | null
          creator_reaction_ms?: number | null
          creator_tap_at?: string | null
          expires_at?: string
          flash_at?: string | null
          id?: string
          metadata?: Json | null
          opponent_ghost_until?: string | null
          opponent_id?: string | null
          opponent_ping_ms?: number | null
          opponent_reaction_ms?: number | null
          opponent_tap_at?: string | null
          resolved_at?: string | null
          server_compensation_ms?: number | null
          stake_amount?: number
          stake_percentage?: number
          stake_type?: string
          status?: string
          winner_id?: string | null
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
          payment_intent_id: string | null
          radius_generated: number
          user_id: string
        }
        Insert: {
          clue_count: number
          cost_eur: number
          created_at?: string
          id?: string
          payment_intent_id?: string | null
          radius_generated: number
          user_id: string
        }
        Update: {
          clue_count?: number
          cost_eur?: number
          created_at?: string
          id?: string
          payment_intent_id?: string | null
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
          {
            foreignKeyName: "clues_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_user_intel_clues"
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
      dna_mf_links: {
        Row: {
          created_at: string
          id: string
          length: number
          node_from: string
          node_to: string
          seed: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          length: number
          node_from: string
          node_to: string
          seed: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          length?: number
          node_from?: string
          node_to?: string
          seed?: number
          user_id?: string
        }
        Relationships: []
      }
      dna_mf_nodes_seen: {
        Row: {
          first_seen_at: string
          id: string
          node_id: string
          seed: number
          user_id: string
        }
        Insert: {
          first_seen_at?: string
          id?: string
          node_id: string
          seed: number
          user_id: string
        }
        Update: {
          first_seen_at?: string
          id?: string
          node_id?: string
          seed?: number
          user_id?: string
        }
        Relationships: []
      }
      dna_mind_fractal_sessions: {
        Row: {
          completion_ratio: number
          created_at: string | null
          id: string
          moves: number
          seed: number
          time_spent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completion_ratio?: number
          created_at?: string | null
          id?: string
          moves?: number
          seed: number
          time_spent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completion_ratio?: number
          created_at?: string | null
          id?: string
          moves?: number
          seed?: number
          time_spent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dna_mind_links: {
        Row: {
          created_at: string
          id: string
          intensity: number
          node_a: number
          node_b: number
          seed: number
          theme: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intensity?: number
          node_a: number
          node_b: number
          seed: number
          theme: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intensity?: number
          node_a?: number
          node_b?: number
          seed?: number
          theme?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_mind_milestones: {
        Row: {
          created_at: string
          id: string
          level: number
          message: string
          seed: number
          theme: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level: number
          message: string
          seed: number
          theme: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          message?: string
          seed?: number
          theme?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_neural_moves: {
        Row: {
          action: string
          created_at: string
          id: number
          payload: Json
          session_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          payload: Json
          session_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          payload?: Json
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_neural_moves_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dna_neural_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_neural_sessions: {
        Row: {
          elapsed_seconds: number
          id: string
          last_state: Json
          moves: number
          pairs_count: number
          seed: string
          solved: boolean
          solved_at: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          elapsed_seconds?: number
          id?: string
          last_state?: Json
          moves?: number
          pairs_count: number
          seed: string
          solved?: boolean
          solved_at?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          elapsed_seconds?: number
          id?: string
          last_state?: Json
          moves?: number
          pairs_count?: number
          seed?: string
          solved?: boolean
          solved_at?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_rubik_moves: {
        Row: {
          created_at: string
          id: number
          move: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          move: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          move?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_rubik_state: {
        Row: {
          scramble_seed: string
          size: number
          solved: boolean
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          scramble_seed: string
          size?: number
          solved?: boolean
          state: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          scramble_seed?: string
          size?: number
          solved?: boolean
          state?: Json
          updated_at?: string
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
      intel_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intel_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "intel_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      intel_sessions: {
        Row: {
          created_at: string
          id: string
          meta: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meta?: Json | null
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
      mcp_whitelist: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_enrollments: {
        Row: {
          joined_at: string
          mission_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          mission_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_enrollments_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_status_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_enrollments_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_prizes: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          mission_id: string
          status: string
          title: string
          value_text: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mission_id: string
          status?: string
          title: string
          value_text?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mission_id?: string
          status?: string
          title?: string
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_prizes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "prize_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_prizes_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission_status_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_prizes_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
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
          end_date: string | null
          id: string
          prize_description: string | null
          prize_id: string | null
          prize_image_url: string | null
          prize_value: string | null
          publication_date: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          prize_description?: string | null
          prize_id?: string | null
          prize_image_url?: string | null
          prize_value?: string | null
          publication_date?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          prize_description?: string | null
          prize_id?: string | null
          prize_image_url?: string | null
          prize_value?: string | null
          publication_date?: string | null
          start_date?: string | null
          status?: string
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
      norah_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          intent: string | null
          payload: Json
          phase: string | null
          sentiment: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          intent?: string | null
          payload?: Json
          phase?: string | null
          sentiment?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          intent?: string | null
          payload?: Json
          phase?: string | null
          sentiment?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      norah_memory_episodes: {
        Row: {
          created_at: string
          emotional_peak: string | null
          id: string
          learned_pref: Json | null
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotional_peak?: string | null
          id?: string
          learned_pref?: Json | null
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotional_peak?: string | null
          id?: string
          learned_pref?: Json | null
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      norah_messages: {
        Row: {
          content: string
          context: Json | null
          created_at: string | null
          episodic_summary: string | null
          id: string
          intent: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          context?: Json | null
          created_at?: string | null
          episodic_summary?: string | null
          id?: string
          intent?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          context?: Json | null
          created_at?: string | null
          episodic_summary?: string | null
          id?: string
          intent?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      norah_proactive_notifications: {
        Row: {
          body: string
          clicked: boolean | null
          clicked_at: string | null
          created_at: string | null
          id: string
          notification_type: string
          payload: Json | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          clicked?: boolean | null
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          notification_type: string
          payload?: Json | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          clicked?: boolean | null
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          notification_type?: string
          payload?: Json | null
          sent_at?: string | null
          title?: string
          user_id?: string
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
            referencedRelation: "battle_top_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personality_quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personality_quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_agent_profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "personality_quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_agent_status"
            referencedColumns: ["user_id"]
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
      prize_categories: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
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
          buzz_map_walkthrough_completed: boolean | null
          buzz_walkthrough_completed: boolean | null
          can_access_app: boolean | null
          choose_plan_seen: boolean
          city: string | null
          cookie_consent: Json | null
          country: string | null
          created_at: string
          credits: number | null
          current_streak_days: number | null
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
          last_check_in_date: string | null
          last_cookie_banner_shown: string | null
          last_name: string | null
          last_plan_change: string | null
          longest_streak_days: number | null
          notifications_enabled: boolean | null
          phone: string | null
          plan: string | null
          postal_code: string | null
          pre_registration_date: string | null
          preferred_language: string | null
          preferred_rewards: string[] | null
          pulse_energy: number
          push_notifications_enabled: boolean | null
          rank_id: number | null
          rank_updated_at: string | null
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
          walkthrough_step_buzz: number | null
          walkthrough_step_buzz_map: number | null
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
          buzz_map_walkthrough_completed?: boolean | null
          buzz_walkthrough_completed?: boolean | null
          can_access_app?: boolean | null
          choose_plan_seen?: boolean
          city?: string | null
          cookie_consent?: Json | null
          country?: string | null
          created_at?: string
          credits?: number | null
          current_streak_days?: number | null
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
          last_check_in_date?: string | null
          last_cookie_banner_shown?: string | null
          last_name?: string | null
          last_plan_change?: string | null
          longest_streak_days?: number | null
          notifications_enabled?: boolean | null
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          pre_registration_date?: string | null
          preferred_language?: string | null
          preferred_rewards?: string[] | null
          pulse_energy?: number
          push_notifications_enabled?: boolean | null
          rank_id?: number | null
          rank_updated_at?: string | null
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
          walkthrough_step_buzz?: number | null
          walkthrough_step_buzz_map?: number | null
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
          buzz_map_walkthrough_completed?: boolean | null
          buzz_walkthrough_completed?: boolean | null
          can_access_app?: boolean | null
          choose_plan_seen?: boolean
          city?: string | null
          cookie_consent?: Json | null
          country?: string | null
          created_at?: string
          credits?: number | null
          current_streak_days?: number | null
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
          last_check_in_date?: string | null
          last_cookie_banner_shown?: string | null
          last_name?: string | null
          last_plan_change?: string | null
          longest_streak_days?: number | null
          notifications_enabled?: boolean | null
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          pre_registration_date?: string | null
          preferred_language?: string | null
          preferred_rewards?: string[] | null
          pulse_energy?: number
          push_notifications_enabled?: boolean | null
          rank_id?: number | null
          rank_updated_at?: string | null
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
          walkthrough_step_buzz?: number | null
          walkthrough_step_buzz_map?: number | null
          weekly_hints?: string | null
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
      pulse_abuse_counters: {
        Row: {
          count: number
          type: string
          user_id: string
          window_start: string
        }
        Insert: {
          count?: number
          type: string
          user_id: string
          window_start: string
        }
        Update: {
          count?: number
          type?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      pulse_config_weights: {
        Row: {
          cooldown_sec: number
          created_at: string
          description: string | null
          enabled: boolean
          per_user_cap_day: number
          type: string
          updated_at: string
          weight: number
        }
        Insert: {
          cooldown_sec?: number
          created_at?: string
          description?: string | null
          enabled?: boolean
          per_user_cap_day?: number
          type: string
          updated_at?: string
          weight: number
        }
        Update: {
          cooldown_sec?: number
          created_at?: string
          description?: string | null
          enabled?: boolean
          per_user_cap_day?: number
          type?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      pulse_cosmetics: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          display_name: string
          id: string
          key: string
          tier: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          key: string
          tier?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          key?: string
          tier?: number
        }
        Relationships: []
      }
      pulse_events: {
        Row: {
          created_at: string
          device_hash: string | null
          id: string
          meta: Json
          type: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          device_hash?: string | null
          id?: string
          meta?: Json
          type: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          device_hash?: string | null
          id?: string
          meta?: Json
          type?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "pulse_events_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "pulse_config_weights"
            referencedColumns: ["type"]
          },
        ]
      }
      pulse_global_triggers: {
        Row: {
          created_at: string
          id: number
          payload: Json | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: number
          payload?: Json | null
          type: string
        }
        Update: {
          created_at?: string
          id?: number
          payload?: Json | null
          type?: string
        }
        Relationships: []
      }
      pulse_ritual_claims: {
        Row: {
          claimed_at: string
          id: number
          ritual_id: number
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: number
          ritual_id: number
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: number
          ritual_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_ritual_claims_ritual_id_fkey"
            columns: ["ritual_id"]
            isOneToOne: false
            referencedRelation: "pulse_rituals"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_rituals: {
        Row: {
          created_at: string
          ended_at: string | null
          id: number
          reward_package: Json
          scale_applied: boolean | null
          snapshot: number | null
          started_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: number
          reward_package?: Json
          scale_applied?: boolean | null
          snapshot?: number | null
          started_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: number
          reward_package?: Json
          scale_applied?: boolean | null
          snapshot?: number | null
          started_at?: string
        }
        Relationships: []
      }
      pulse_sponsor_slots: {
        Row: {
          created_at: string
          creative_meta: Json
          id: string
          intended_delta: number
          sponsor_name: string
          status: string
          updated_at: string
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string
          creative_meta?: Json
          id?: string
          intended_delta: number
          sponsor_name: string
          status?: string
          updated_at?: string
          window_end: string
          window_start: string
        }
        Update: {
          created_at?: string
          creative_meta?: Json
          id?: string
          intended_delta?: number
          sponsor_name?: string
          status?: string
          updated_at?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      pulse_state: {
        Row: {
          id: number
          last_threshold: number
          updated_at: string
          value: number
        }
        Insert: {
          id: number
          last_threshold?: number
          updated_at?: string
          value?: number
        }
        Update: {
          id?: number
          last_threshold?: number
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      pulse_thresholds_log: {
        Row: {
          id: string
          reached_at: string
          threshold: number
          value_snapshot: number
        }
        Insert: {
          id?: string
          reached_at?: string
          threshold: number
          value_snapshot: number
        }
        Update: {
          id?: string
          reached_at?: string
          threshold?: number
          value_snapshot?: number
        }
        Relationships: []
      }
      pulse_user_cosmetics: {
        Row: {
          acquired_at: string
          cosmetic_key: string
          id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          cosmetic_key: string
          id?: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          cosmetic_key?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_user_cosmetics_cosmetic_key_fkey"
            columns: ["cosmetic_key"]
            isOneToOne: false
            referencedRelation: "pulse_cosmetics"
            referencedColumns: ["key"]
          },
        ]
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
      push_logs: {
        Row: {
          created_at: string | null
          endpoint: string | null
          error_message: string | null
          id: string
          payload: Json | null
          status: string
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status: string
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: string
          status_code?: number | null
          user_id?: string | null
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
          id: string
          is_active: boolean | null
          last_used: string | null
          last_used_at: string | null
          p256dh: string | null
          platform: string | null
          provider: string
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
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          last_used_at?: string | null
          p256dh?: string | null
          platform?: string | null
          provider?: string
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
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          last_used_at?: string | null
          p256dh?: string | null
          platform?: string | null
          provider?: string
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
          ip_address: unknown
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
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
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
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
      system_roles: {
        Row: {
          code: string
          created_at: string | null
          id: string
          label: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          label: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          label?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "battle_top_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_buzz_counter_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_buzz_counter_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_agent_profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_buzz_counter_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_agent_status"
            referencedColumns: ["user_id"]
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
            referencedRelation: "battle_top_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_buzz_map_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_buzz_map_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_agent_profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_buzz_map_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_agent_status"
            referencedColumns: ["user_id"]
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
            referencedRelation: "battle_top_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_clues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_clues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_agent_profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_clues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_agent_status"
            referencedColumns: ["user_id"]
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
      user_dna_neural_links: {
        Row: {
          created_at: string
          id: string
          link_length: number
          node_a: number
          node_b: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_length: number
          node_a: number
          node_b: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_length?: number
          node_a?: number
          node_b?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dna_neural_links_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_dna_neural_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dna_neural_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number
          id: string
          links_made: number
          moves: number
          pairs_count: number
          seed: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number
          id?: string
          links_made?: number
          moves?: number
          pairs_count?: number
          seed: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number
          id?: string
          links_made?: number
          moves?: number
          pairs_count?: number
          seed?: string
          user_id?: string
        }
        Relationships: []
      }
      user_dna_profile: {
        Row: {
          last_seed: string | null
          level: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          last_seed?: string | null
          level?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          last_seed?: string | null
          level?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_flags: {
        Row: {
          hide_tutorial: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          hide_tutorial?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          hide_tutorial?: boolean
          updated_at?: string
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
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_map_areas: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          clue_id: string | null
          created_at: string
          id: string
          lat: number
          level: number | null
          level_index: number | null
          lng: number
          price_eur: number | null
          radius_km: number
          source: string | null
          user_id: string
          week: number
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          clue_id?: string | null
          created_at?: string
          id?: string
          lat: number
          level?: number | null
          level_index?: number | null
          lng: number
          price_eur?: number | null
          radius_km: number
          source?: string | null
          user_id: string
          week: number
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          clue_id?: string | null
          created_at?: string
          id?: string
          lat?: number
          level?: number | null
          level_index?: number | null
          lng?: number
          price_eur?: number | null
          radius_km?: number
          source?: string | null
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
      user_push_settings: {
        Row: {
          id: string
          unified_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          unified_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          unified_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
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
          created_at: string
          device_info: Json | null
          endpoint: string
          id: string
          is_active: boolean
          keys: Json
          last_used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          endpoint: string
          id?: string
          is_active?: boolean
          keys: Json
          last_used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          endpoint?: string
          id?: string
          is_active?: boolean
          keys?: Json
          last_used_at?: string | null
          user_id?: string | null
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
      weekly_leaderboard: {
        Row: {
          created_at: string | null
          id: string
          rank: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          rank?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          rank?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      ai_docs_kpis: {
        Row: {
          documents: number | null
          embeddings: number | null
          last_embed_at: string | null
        }
        Relationships: []
      }
      battle_metrics: {
        Row: {
          avg_reaction_ms: number | null
          fastest_reaction_ms: number | null
          losses: number | null
          slowest_reaction_ms: number | null
          total_battles: number | null
          user_id: string | null
          win_rate_percentage: number | null
          wins: number | null
        }
        Relationships: []
      }
      battle_top_agents: {
        Row: {
          agent_code: string | null
          elo: number | null
          id: string | null
          username: string | null
          wins: number | null
        }
        Relationships: []
      }
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
      current_week_leaderboard: {
        Row: {
          agent_code: string | null
          avatar_url: string | null
          current_week: number | null
          current_year: number | null
          rank: number | null
          total_xp: number | null
          user_id: string | null
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
      mission_status_v: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string | null
          is_live: boolean | null
          prize_description: string | null
          prize_id: string | null
          prize_image_url: string | null
          prize_value: string | null
          publication_date: string | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          is_live?: never
          prize_description?: string | null
          prize_id?: string | null
          prize_image_url?: string | null
          prize_value?: string | null
          publication_date?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          is_live?: never
          prize_description?: string | null
          prize_id?: string | null
          prize_image_url?: string | null
          prize_value?: string | null
          publication_date?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
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
      pulse_leaderboard_daily: {
        Row: {
          agent_code: string | null
          event_count: number | null
          full_name: string | null
          last_contribution: string | null
          total_contribution: number | null
        }
        Relationships: []
      }
      pulse_leaderboard_weekly: {
        Row: {
          agent_code: string | null
          event_count: number | null
          full_name: string | null
          last_contribution: string | null
          total_contribution: number | null
        }
        Relationships: []
      }
      v_agent_profile: {
        Row: {
          agent_code: string | null
          display_name: string | null
          plan_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_code?: never
          display_name?: never
          plan_type?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_code?: never
          display_name?: never
          plan_type?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_agent_status: {
        Row: {
          agent_code: string | null
          current_week: number | null
          progress_ratio: number | null
          user_id: string | null
        }
        Insert: {
          agent_code?: never
          current_week?: never
          progress_ratio?: never
          user_id?: string | null
        }
        Update: {
          agent_code?: never
          current_week?: never
          progress_ratio?: never
          user_id?: string | null
        }
        Relationships: []
      }
      v_dna_mind_links_recent: {
        Row: {
          created_at: string | null
          id: string | null
          intensity: number | null
          node_a: number | null
          node_b: number | null
          seed: number | null
          theme: string | null
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
      v_user_intel_clues: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          title?: string | null
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
      v_webpush_diag: {
        Row: {
          created_at: string | null
          detected_provider: string | null
          endpoint: string | null
          endpoint_host: string | null
          endpoint_type: string | null
          platform: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          detected_provider?: never
          endpoint?: string | null
          endpoint_host?: never
          endpoint_type?: string | null
          platform?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          detected_provider?: never
          endpoint?: string | null
          endpoint_host?: never
          endpoint_type?: string | null
          platform?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webpush_subscriptions_flat: {
        Row: {
          auth: string | null
          created_at: string | null
          device_info: Json | null
          endpoint: string | null
          id: string | null
          is_active: boolean | null
          last_used_at: string | null
          p256dh: string | null
          user_id: string | null
        }
        Insert: {
          auth?: never
          created_at?: string | null
          device_info?: Json | null
          endpoint?: string | null
          id?: string | null
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh?: never
          user_id?: string | null
        }
        Update: {
          auth?: never
          created_at?: string | null
          device_info?: Json | null
          endpoint?: string | null
          id?: string | null
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _gen_unique_agent_code: { Args: { len?: number }; Returns: string }
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
      ai_rag_search: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_text: string
          doc_id: string
          similarity: number
          title: string
        }[]
      }
      ai_rag_search_vec: {
        Args: {
          in_locale?: string
          match_count?: number
          query_embedding: number[]
        }
        Returns: {
          category: string
          chunk_idx: number
          chunk_text: string
          distance: number
          doc_id: string
          locale: string
          title: string
        }[]
      }
      ai_rag_search_vec_json:
        | {
            Args: { payload: Json }
            Returns: {
              category: string
              chunk_idx: number
              chunk_text: string
              distance: number
              doc_id: string
              locale: string
              title: string
            }[]
          }
        | { Args: { k: number; minscore: number; qvec: string }; Returns: Json }
      assign_area_radius: { Args: { p_mission_id: string }; Returns: number }
      award_pulse_energy: {
        Args: {
          p_delta_pe: number
          p_metadata?: Json
          p_reason: string
          p_user_id: string
        }
        Returns: Json
      }
      award_xp:
        | {
            Args: { p_source: string; p_user_id: string; p_xp_amount: number }
            Returns: undefined
          }
        | { Args: { p_user_id: string; p_xp_amount: number }; Returns: Json }
      block_ip: {
        Args: {
          block_duration_minutes?: number
          block_reason?: string
          ip_addr: unknown
        }
        Returns: undefined
      }
      buzz_today_count: { Args: { p_user_id: string }; Returns: number }
      calculate_access_start_date: {
        Args: { plan_name: string }
        Returns: string
      }
      calculate_access_start_time: { Args: { p_plan: string }; Returns: string }
      calculate_buzz_price: { Args: { daily_count: number }; Returns: number }
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
      can_user_access_mission: { Args: { user_id: string }; Returns: boolean }
      can_user_buzz_mappa: { Args: { p_user_id: string }; Returns: boolean }
      can_user_use_buzz: { Args: { p_user_id: string }; Returns: boolean }
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
      cleanup_duplicate_subscriptions: { Args: never; Returns: Json }
      cleanup_expired_idempotency_keys: { Args: never; Returns: undefined }
      cleanup_expired_push_tokens: { Args: never; Returns: undefined }
      cleanup_old_abuse_logs: { Args: never; Returns: undefined }
      cleanup_security_tables: { Args: never; Returns: undefined }
      consume_buzz_mappa: { Args: { p_user_id: string }; Returns: Json }
      consume_buzz_usage: { Args: { p_user_id: string }; Returns: boolean }
      consume_credit: {
        Args: { p_credit_type: string; p_user_id: string }
        Returns: boolean
      }
      consume_free_buzz: {
        Args: never
        Returns: Database["public"]["CompositeTypes"]["consume_free_buzz_result"]
        SetofOptions: {
          from: "*"
          to: "consume_free_buzz_result"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      count_distinct_push_tokens: { Args: never; Returns: number }
      count_push_tokens: { Args: never; Returns: number }
      count_push_tokens_since: { Args: { since: string }; Returns: number }
      create_free_subscription: { Args: never; Returns: Json }
      debug_vec_info: { Args: never; Returns: Json }
      dna_get_rubik_state: { Args: never; Returns: Json }
      dna_log_rubik_move: { Args: { p_move: string }; Returns: undefined }
      dna_set_rubik_state: {
        Args: { p_scramble_seed: string; p_solved: boolean; p_state: Json }
        Returns: undefined
      }
      ensure_agent_dna: { Args: { p_user: string }; Returns: undefined }
      exec_sql: { Args: { sql: string }; Returns: Json }
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
      fn_dna_apply_delta: {
        Args: {
          p_delta: Json
          p_note?: string
          p_source: string
          p_user: string
        }
        Returns: undefined
      }
      fn_dna_compute_archetype: {
        Args: {
          p_a: number
          p_e: number
          p_i: number
          p_r: number
          p_v: number
        }
        Returns: string
      }
      force_subscription_sync: { Args: { p_user_id: string }; Returns: boolean }
      force_user_to_base_tier: { Args: { p_user_id: string }; Returns: Json }
      generate_agent_code: { Args: never; Returns: string }
      generate_qr_code: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      generate_unique_agent_code: { Args: never; Returns: string }
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
      get_agent_dna_visual:
        | { Args: { user_id: string }; Returns: Json }
        | { Args: { seed?: boolean }; Returns: Json }
      get_authenticated_user_id: { Args: never; Returns: string }
      get_buzz_override: {
        Args: never
        Returns: {
          cooldown_disabled: boolean
          expires_at: string
          free_remaining: number
        }[]
      }
      get_current_game_week: { Args: never; Returns: number }
      get_current_mission_week: { Args: never; Returns: number }
      get_current_user_profile_safe: {
        Args: never
        Returns: {
          email: string
          role: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_current_week_and_year: {
        Args: never
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
      get_max_buzz_for_week: { Args: { week_num: number }; Returns: number }
      get_max_map_generations: { Args: { p_week: number }; Returns: number }
      get_mf_progress: {
        Args: { p_seed: number; p_user_id: string }
        Returns: Json
      }
      get_my_agent_code: {
        Args: never
        Returns: {
          agent_code: string
        }[]
      }
      get_my_balance: { Args: never; Returns: Json }
      get_recent_links: {
        Args: { p_limit?: number; p_seed: number; p_user_id: string }
        Returns: {
          created_at: string
          intensity: number
          node_a: number
          node_b: number
          theme: string
        }[]
      }
      get_top_agents: {
        Args: never
        Returns: {
          agent_code: string
          elo: number
          id: string
          username: string
          wins: number
        }[]
      }
      get_unread_count: { Args: { p_user_id?: string }; Returns: number }
      get_user_by_email: {
        Args: { email_param: string }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_flags: {
        Args: never
        Returns: {
          hide_tutorial: boolean
        }[]
      }
      get_user_role_safe: { Args: { p_user_id: string }; Returns: string }
      get_user_roles: {
        Args: { user_id: string }
        Returns: {
          role: string
        }[]
      }
      get_user_sync_status: { Args: { p_user_id: string }; Returns: Json }
      get_user_weekly_buzz_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_xp_status: { Args: { p_user_id: string }; Returns: Json }
      get_week_start_date: { Args: never; Returns: string }
      grant_buzz: {
        Args: { p_count: number; p_source: string; p_user: string }
        Returns: undefined
      }
      handle_new_user: {
        Args: { new_user_id: string; user_email: string }
        Returns: undefined
      }
      has_admin_role_secure:
        | { Args: never; Returns: boolean }
        | { Args: { user_id_param: string }; Returns: boolean }
      has_mission_started: { Args: never; Returns: boolean }
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
      inc_buzz_today: { Args: { p_user_id: string }; Returns: number }
      increment_buzz_counter: { Args: { p_user_id: string }; Returns: number }
      increment_buzz_map_counter: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_daily_final_shot_counter: {
        Args: { p_mission_id: string; p_user_id: string }
        Returns: undefined
      }
      increment_dna_attribute: {
        Args: { p_attribute: string; p_user: string }
        Returns: boolean
      }
      increment_map_generation_counter: {
        Args: { p_user_id: string; p_week: number }
        Returns: number
      }
      increment_xp: {
        Args: { p_amount: number; p_user: string }
        Returns: undefined
      }
      interest_track: { Args: { payload: Json }; Returns: undefined }
      invoke_auto_push_cron: { Args: never; Returns: Json }
      is_admin: { Args: { user_id?: string }; Returns: boolean }
      is_admin_email_safe: { Args: { p_email: string }; Returns: boolean }
      is_admin_secure: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_ip_blocked: { Args: { ip_addr: unknown }; Returns: boolean }
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
        SetofOptions: {
          from: "*"
          to: "qr_redemptions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      log_potential_abuse: {
        Args: { p_event_type: string; p_user_id: string }
        Returns: boolean
      }
      log_security_event:
        | {
            Args: { p_event_data?: Json; p_event_type: string }
            Returns: string
          }
        | {
            Args: {
              event_data_param?: Json
              event_type_param: string
              severity_param?: string
              user_id_param?: string
            }
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
      lookup_user_id_by_email: { Args: { p_email: string }; Returns: string }
      mark_choose_plan_seen: { Args: never; Returns: undefined }
      mark_norah_notification_clicked: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      mf_add_link: {
        Args: { p_from: string; p_length: number; p_seed: number; p_to: string }
        Returns: undefined
      }
      mf_health: { Args: never; Returns: Json }
      mf_upsert_seen: {
        Args: { p_node_ids: string[]; p_seed: number }
        Returns: undefined
      }
      mirror_get_watermark: { Args: { p_name: string }; Returns: string }
      mirror_insert_notification_logs: {
        Args: { p_records: Json }
        Returns: number
      }
      mirror_set_watermark: {
        Args: { p_last_run_at: string; p_name: string }
        Returns: undefined
      }
      normalize_feed_url: { Args: { input_url: string }; Returns: string }
      perform_security_check: { Args: never; Returns: Json }
      pick_random_opponent: {
        Args: { p_me: string }
        Returns: {
          agent_code: string
          id: string
          username: string
        }[]
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
      recompute_rank: { Args: { p_user_id: string }; Returns: undefined }
      record_intelligence_tool_usage: {
        Args: { p_mission_id: string; p_tool_name: string; p_user_id: string }
        Returns: boolean
      }
      redeem_qr: { Args: { code_input: string }; Returns: Json }
      refresh_battle_metrics: { Args: never; Returns: undefined }
      refresh_current_week_leaderboard: { Args: never; Returns: undefined }
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
      rpc_neural_complete:
        | {
            Args: {
              p_duration_ms: number
              p_session_id: string
              p_xp_gain: number
            }
            Returns: undefined
          }
        | { Args: { p_session: string }; Returns: undefined }
      rpc_neural_link: {
        Args: {
          p_length: number
          p_node_a: number
          p_node_b: number
          p_session_id: string
        }
        Returns: undefined
      }
      rpc_neural_save: {
        Args: {
          p_elapsed: number
          p_moves: number
          p_session: string
          p_state: Json
        }
        Returns: undefined
      }
      rpc_neural_start:
        | {
            Args: { p_pairs?: number }
            Returns: {
              elapsed_seconds: number
              id: string
              last_state: Json
              moves: number
              pairs_count: number
              seed: string
              solved: boolean
              solved_at: string | null
              started_at: string
              user_id: string
            }
            SetofOptions: {
              from: "*"
              to: "dna_neural_sessions"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | { Args: { p_pairs?: number; p_seed: string }; Returns: string }
      rpc_pulse_decay_tick: {
        Args: { p_decay_percent?: number }
        Returns: Json
      }
      rpc_pulse_event_record: {
        Args: { p_meta?: Json; p_type: string; p_user_id: string }
        Returns: Json
      }
      rpc_pulse_ritual_can_start: { Args: never; Returns: Json }
      rpc_pulse_ritual_claim: { Args: { p_user: string }; Returns: Json }
      rpc_pulse_ritual_close: { Args: never; Returns: Json }
      rpc_pulse_ritual_start: { Args: never; Returns: Json }
      rpc_pulse_ritual_test_fire: { Args: never; Returns: Json }
      rpc_pulse_state_read: { Args: never; Returns: Json }
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
      set_agent_dna_visual: { Args: { payload: Json }; Returns: boolean }
      set_hide_tutorial: { Args: { p_hide: boolean }; Returns: undefined }
      setup_developer_user: { Args: { uid: string }; Returns: undefined }
      submit_final_shot: {
        Args: { p_latitude: number; p_longitude: number; p_mission_id: string }
        Returns: Json
      }
      supabase_client_health: { Args: never; Returns: Json }
      sync_user_permissions: { Args: { p_user_id: string }; Returns: undefined }
      trigger_mirror_push_harvest: { Args: never; Returns: Json }
      update_personality_quiz_result:
        | {
            Args: {
              p_assigned_description: string
              p_assigned_type: string
              p_quiz_answers: Json
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: { p_investigative_style: string; p_user_id: string }
            Returns: undefined
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
      upsert_ai_doc: {
        Args: {
          p_source: string
          p_tags: string[]
          p_text: string
          p_title: string
          p_url: string
        }
        Returns: string
      }
      upsert_dna_mind_fractal_session: {
        Args: {
          p_completion_ratio: number
          p_moves: number
          p_seed: number
          p_time_spent: number
        }
        Returns: undefined
      }
      upsert_dna_mind_link: {
        Args: {
          p_a: number
          p_b: number
          p_intensity?: number
          p_seed: number
          p_theme: string
          p_user_id: string
        }
        Returns: Json
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
      upsert_prize_category: { Args: { cat_name: string }; Returns: string }
      upsert_user_position: {
        Args: { lat: number; lng: number; uid: string }
        Returns: undefined
      }
      validate_buzz_user_id: { Args: { p_user_id: string }; Returns: boolean }
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
      push_kind: "morning" | "buzz" | "buzzmap" | "motivation" | "custom"
      referral_status: "pending" | "registered"
    }
    CompositeTypes: {
      consume_free_buzz_result: {
        ok: boolean | null
        free_remaining: number | null
        message: string | null
      }
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
      push_kind: ["morning", "buzz", "buzzmap", "motivation", "custom"],
      referral_status: ["pending", "registered"],
    },
  },
} as const
