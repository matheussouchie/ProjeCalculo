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
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          created_at?: string;
        };
        Update: {
          name?: string | null;
          email?: string;
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
      projects: {
        Row: {
          id: string;
          user_id: string;
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
        ];
      };
      project_rooms: {
        Row: {
          id: string;
          project_id: string;
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
          room_type: string;
          room_label: string;
          quantity?: number;
          square_meters: number;
          weight_used?: number;
          complexity_points?: number;
        };
        Update: {
          room_type?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
