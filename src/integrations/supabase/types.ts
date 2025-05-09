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
      buzz_purchases: {
        Row: {
          created_at: string
          id: string
          transaction_id: string | null
          used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          transaction_id?: string | null
          used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          transaction_id?: string | null
          used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buzz_purchases_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
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
          credits: number
          email: string
          id: string
          name: string
          referral_code: string | null
          referrer: string | null
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          credits?: number
          email: string
          id?: string
          name: string
          referral_code?: string | null
          referrer?: string | null
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          credits?: number
          email?: string
          id?: string
          name?: string
          referral_code?: string | null
          referrer?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          agent_code: string | null
          agent_title: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          credits: number | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          investigative_style: string | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          role: string
          subscription_tier: string
          updated_at: string
          username: string | null
        }
        Insert: {
          address?: string | null
          agent_code?: string | null
          agent_title?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          investigative_style?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string
          subscription_tier?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          address?: string | null
          agent_code?: string | null
          agent_title?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          investigative_style?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string
          subscription_tier?: string
          updated_at?: string
          username?: string | null
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
      user_clues: {
        Row: {
          clue_id: string
          id: string
          is_unlocked: boolean
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          clue_id: string
          id?: string
          is_unlocked?: boolean
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          clue_id?: string
          id?: string
          is_unlocked?: boolean
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_clues_clue_id_fkey"
            columns: ["clue_id"]
            isOneToOne: false
            referencedRelation: "clues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_referral_credits: {
        Args: { referrer_email: string; credits_to_add: number }
        Returns: undefined
      }
      update_user_subscription_tier: {
        Args: { user_id_param: string; new_tier: string }
        Returns: undefined
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
    Enums: {},
  },
} as const
