export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_logs_table: {
        Row: {
          log_action_type: string | null;
          log_candidate_name: string | null;
          log_description: string | null;
          log_id: string;
          log_interview_id: string | null;
          log_modified_by: string | null;
          log_timestamp: string | null;
        };
        Insert: {
          log_action_type?: string | null;
          log_candidate_name?: string | null;
          log_description?: string | null;
          log_id?: string;
          log_interview_id?: string | null;
          log_modified_by?: string | null;
          log_timestamp?: string | null;
        };
        Update: {
          log_action_type?: string | null;
          log_candidate_name?: string | null;
          log_description?: string | null;
          log_id?: string;
          log_interview_id?: string | null;
          log_modified_by?: string | null;
          log_timestamp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_table_log_interview_id_fkey";
            columns: ["log_interview_id"];
            isOneToOne: false;
            referencedRelation: "interviews_table";
            referencedColumns: ["interview_id"];
          },
        ];
      };
      candidates_table: {
        Row: {
          candidate_avatar_url: string | null;
          candidate_created_at: string | null;
          candidate_email: string;
          candidate_full_name: string;
          candidate_id: string;
        };
        Insert: {
          candidate_avatar_url?: string | null;
          candidate_created_at?: string | null;
          candidate_email: string;
          candidate_full_name: string;
          candidate_id?: string;
        };
        Update: {
          candidate_avatar_url?: string | null;
          candidate_created_at?: string | null;
          candidate_email?: string;
          candidate_full_name?: string;
          candidate_id?: string;
        };
        Relationships: [];
      };
      hiring_processes_table: {
        Row: {
          hiring_process_candidate_id: string | null;
          hiring_process_created_at: string | null;
          hiring_process_id: string;
          hiring_process_role_id: string | null;
          hiring_process_status:
            | Database["public"]["Enums"]["hiring_process_status"]
            | null;
        };
        Insert: {
          hiring_process_candidate_id?: string | null;
          hiring_process_created_at?: string | null;
          hiring_process_id?: string;
          hiring_process_role_id?: string | null;
          hiring_process_status?:
            | Database["public"]["Enums"]["hiring_process_status"]
            | null;
        };
        Update: {
          hiring_process_candidate_id?: string | null;
          hiring_process_created_at?: string | null;
          hiring_process_id?: string;
          hiring_process_role_id?: string | null;
          hiring_process_status?:
            | Database["public"]["Enums"]["hiring_process_status"]
            | null;
        };
        Relationships: [
          {
            foreignKeyName: "hiring_processes_table_hiring_process_candidate_id_fkey";
            columns: ["hiring_process_candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates_table";
            referencedColumns: ["candidate_id"];
          },
          {
            foreignKeyName: "hiring_processes_table_hiring_process_role_id_fkey";
            columns: ["hiring_process_role_id"];
            isOneToOne: false;
            referencedRelation: "roles_table";
            referencedColumns: ["role_id"];
          },
        ];
      };
      interview_steps_table: {
        Row: {
          interview_step_created_at: string | null;
          interview_step_hiring_process_id: string | null;
          interview_step_id: string;
          interview_step_name: string;
          interview_step_order_index: number;
          interview_step_status:
            | Database["public"]["Enums"]["step_status"]
            | null;
          interview_step_type: Database["public"]["Enums"]["interview_type"];
        };
        Insert: {
          interview_step_created_at?: string | null;
          interview_step_hiring_process_id?: string | null;
          interview_step_id?: string;
          interview_step_name: string;
          interview_step_order_index: number;
          interview_step_status?:
            | Database["public"]["Enums"]["step_status"]
            | null;
          interview_step_type: Database["public"]["Enums"]["interview_type"];
        };
        Update: {
          interview_step_created_at?: string | null;
          interview_step_hiring_process_id?: string | null;
          interview_step_id?: string;
          interview_step_name?: string;
          interview_step_order_index?: number;
          interview_step_status?:
            | Database["public"]["Enums"]["step_status"]
            | null;
          interview_step_type?: Database["public"]["Enums"]["interview_type"];
        };
        Relationships: [
          {
            foreignKeyName: "interview_steps_table_interview_step_hiring_process_id_fkey";
            columns: ["interview_step_hiring_process_id"];
            isOneToOne: false;
            referencedRelation: "hiring_processes_table";
            referencedColumns: ["hiring_process_id"];
          },
        ];
      };
      interviewers_table: {
        Row: {
          interviewer_avatar_url: string | null;
          interviewer_created_at: string | null;
          interviewer_email: string;
          interviewer_full_name: string;
          interviewer_id: string;
          interviewer_role_id: string | null;
        };
        Insert: {
          interviewer_avatar_url?: string | null;
          interviewer_created_at?: string | null;
          interviewer_email: string;
          interviewer_full_name: string;
          interviewer_id?: string;
          interviewer_role_id?: string | null;
        };
        Update: {
          interviewer_avatar_url?: string | null;
          interviewer_created_at?: string | null;
          interviewer_email?: string;
          interviewer_full_name?: string;
          interviewer_id?: string;
          interviewer_role_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interviewers_table_interviewer_role_id_fkey";
            columns: ["interviewer_role_id"];
            isOneToOne: false;
            referencedRelation: "roles_table";
            referencedColumns: ["role_id"];
          },
        ];
      };
      interviews_table: {
        Row: {
          interview_created_at: string | null;
          interview_end_at: string;
          interview_id: string;
          interview_interviewer_id: string | null;
          interview_meeting_link: string | null;
          interview_notes: string | null;
          interview_recorded_link: string | null;
          interview_start_at: string;
          interview_status:
            | Database["public"]["Enums"]["interview_status"]
            | null;
          interview_step_id: string | null;
        };
        Insert: {
          interview_created_at?: string | null;
          interview_end_at: string;
          interview_id?: string;
          interview_interviewer_id?: string | null;
          interview_meeting_link?: string | null;
          interview_notes?: string | null;
          interview_recorded_link?: string | null;
          interview_start_at: string;
          interview_status?:
            | Database["public"]["Enums"]["interview_status"]
            | null;
          interview_step_id?: string | null;
        };
        Update: {
          interview_created_at?: string | null;
          interview_end_at?: string;
          interview_id?: string;
          interview_interviewer_id?: string | null;
          interview_meeting_link?: string | null;
          interview_notes?: string | null;
          interview_recorded_link?: string | null;
          interview_start_at?: string;
          interview_status?:
            | Database["public"]["Enums"]["interview_status"]
            | null;
          interview_step_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interviews_table_interview_interviewer_id_fkey";
            columns: ["interview_interviewer_id"];
            isOneToOne: false;
            referencedRelation: "interviewers_table";
            referencedColumns: ["interviewer_id"];
          },
          {
            foreignKeyName: "interviews_table_interview_step_id_fkey";
            columns: ["interview_step_id"];
            isOneToOne: false;
            referencedRelation: "interview_steps_table";
            referencedColumns: ["interview_step_id"];
          },
        ];
      };
      roles_table: {
        Row: {
          role_created_at: string | null;
          role_department: string | null;
          role_id: string;
          role_title: string;
        };
        Insert: {
          role_created_at?: string | null;
          role_department?: string | null;
          role_id?: string;
          role_title: string;
        };
        Update: {
          role_created_at?: string | null;
          role_department?: string | null;
          role_id?: string;
          role_title?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_hiring_process: { Args: { input_data: Json }; Returns: Json };
      create_role: { Args: { input_data: Json }; Returns: Json };
      get_all_interviewers: { Args: { input_data: Json }; Returns: Json };
      get_all_roles: { Args: { input_data?: Json }; Returns: Json };
      get_calendar_events: { Args: { input_data: Json }; Returns: Json };
      get_candidates_portfolio: { Args: { input_data: Json }; Returns: Json };
      get_hiring_process_details: { Args: { input_data: Json }; Returns: Json };
      get_recent_changes: { Args: never; Returns: Json };
      quick_add_interview: { Args: { input_data: Json }; Returns: Json };
      schedule_step_interview: { Args: { input_data: Json }; Returns: Json };
      update_interview: { Args: { input_data: Json }; Returns: Json };
    };
    Enums: {
      hiring_process_status:
        | "ACTIVE"
        | "HIRED"
        | "REJECTED"
        | "WITHDRAWN"
        | "POOLING";
      interview_status:
        | "SCHEDULED"
        | "CONFIRMED"
        | "COMPLETED"
        | "CANCELLED"
        | "PENDING"
        | "RESCHEDULED";
      interview_type: "DEPARTMENT" | "REQUESTOR" | "HR";
      step_status:
        | "PENDING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "SKIPPED"
        | "FAILED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      hiring_process_status: [
        "ACTIVE",
        "HIRED",
        "REJECTED",
        "WITHDRAWN",
        "POOLING",
      ],
      interview_status: [
        "SCHEDULED",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "PENDING",
        "RESCHEDULED",
      ],
      interview_type: ["DEPARTMENT", "REQUESTOR", "HR"],
      step_status: ["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED", "FAILED"],
    },
  },
} as const;
