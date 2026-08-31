export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          avatar_path: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          avatar_path?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string | null;
          email?: string;
          avatar_path?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      drafts: {
        Row: {
          id: string;
          user_id: string;
          scope: string;
          entity_id: string | null;
          payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scope: string;
          entity_id?: string | null;
          payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          scope?: string;
          entity_id?: string | null;
          payload?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drafts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          prediction_id: string | null;
          name: string;
          total_square_meters: number;
          predicted_days: number;
          actual_days: number | null;
          complexity_score: number;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          prediction_id?: string | null;
          name?: string;
          total_square_meters: number;
          predicted_days: number;
          actual_days?: number | null;
          complexity_score?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          prediction_id?: string | null;
          name?: string;
          total_square_meters?: number;
          predicted_days?: number;
          actual_days?: number | null;
          complexity_score?: number;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_prediction_id_fkey";
            columns: ["prediction_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_rooms: {
        Row: {
          id: string;
          project_id: string;
          user_room_id: string | null;
          room_type: string;
          room_label: string;
          quantity: number;
          square_meters: number;
          weight_used: number;
          complexity_points: number;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_room_id?: string | null;
          room_type: string;
          room_label: string;
          quantity?: number;
          square_meters: number;
          weight_used?: number;
          complexity_points?: number;
        };
        Update: {
          room_type?: string;
          user_room_id?: string | null;
          room_label?: string;
          quantity?: number;
          square_meters?: number;
          weight_used?: number;
          complexity_points?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_rooms_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      user_statistics: {
        Row: {
          id: string;
          user_id: string;
          average_productivity: number;
          average_days: number;
          total_projects: number;
          average_error_margin: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          average_productivity?: number;
          average_days?: number;
          total_projects?: number;
          average_error_margin?: number;
          updated_at?: string;
        };
        Update: {
          average_productivity?: number;
          average_days?: number;
          total_projects?: number;
          average_error_margin?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_statistics_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_rooms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          complexity_weight: number;
          color: string | null;
          is_active: boolean;
          system_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          complexity_weight?: number;
          color?: string | null;
          is_active?: boolean;
          system_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          complexity_weight?: number;
          color?: string | null;
          is_active?: boolean;
          system_key?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_rooms_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: "light" | "dark";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: "light" | "dark";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          theme?: "light" | "dark";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
