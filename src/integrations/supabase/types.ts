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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acoes: {
        Row: {
          bloco_id: string
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          bloco_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          bloco_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "blocos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "vw_status_blocos"
            referencedColumns: ["bloco_id"]
          },
        ]
      }
      acoes_catalogo: {
        Row: {
          bloco_id: string
          created_at: string
          descricao: string
          id: string
          numero: number
          tipo: string
          updated_at: string
        }
        Insert: {
          bloco_id: string
          created_at?: string
          descricao: string
          id: string
          numero?: number
          tipo: string
          updated_at?: string
        }
        Update: {
          bloco_id?: string
          created_at?: string
          descricao?: string
          id?: string
          numero?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_catalogo_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "blocos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_catalogo_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "vw_status_blocos"
            referencedColumns: ["bloco_id"]
          },
        ]
      }
      acoes_progresso: {
        Row: {
          acao_id: string
          created_at: string
          data_realizacao: string
          id: string
          jovem_id: string
          updated_at: string
          validado_por: string | null
        }
        Insert: {
          acao_id: string
          created_at?: string
          data_realizacao?: string
          id?: string
          jovem_id: string
          updated_at?: string
          validado_por?: string | null
        }
        Update: {
          acao_id?: string
          created_at?: string
          data_realizacao?: string
          id?: string
          jovem_id?: string
          updated_at?: string
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acoes_progresso_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: false
            referencedRelation: "acoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_progresso_jovem_id_fkey"
            columns: ["jovem_id"]
            isOneToOne: false
            referencedRelation: "jovens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_progresso_jovem_id_fkey"
            columns: ["jovem_id"]
            isOneToOne: false
            referencedRelation: "vw_status_blocos"
            referencedColumns: ["escoteiro_id"]
          },
        ]
      }
      acolhida_catalogo: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          ordem: number
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      acolhida_progresso: {
        Row: {
          created_at: string
          data_realizacao: string
          id: string
          item_id: string
          jovem_id: string
          updated_at: string
          validado_por: string | null
        }
        Insert: {
          created_at?: string
          data_realizacao?: string
          id?: string
          item_id: string
          jovem_id: string
          updated_at?: string
          validado_por?: string | null
        }
        Update: {
          created_at?: string
          data_realizacao?: string
          id?: string
          item_id?: string
          jovem_id?: string
          updated_at?: string
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acolhida_progresso_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "acolhida_catalogo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acolhida_progresso_jovem_id_fkey"
            columns: ["jovem_id"]
            isOneToOne: false
            referencedRelation: "jovens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acolhida_progresso_jovem_id_fkey"
            columns: ["jovem_id"]
            isOneToOne: false
            referencedRelation: "vw_status_blocos"
            referencedColumns: ["escoteiro_id"]
          },
        ]
      }
      blocos: {
        Row: {
          created_at: string
          descricao: string | null
          eixo_id: string
          id: string
          meta_variaveis: number
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          eixo_id: string
          id?: string
          meta_variaveis?: number
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          eixo_id?: string
          id?: string
          meta_variaveis?: number
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocos_eixo_id_fkey"
            columns: ["eixo_id"]
            isOneToOne: false
            referencedRelation: "eixos"
            referencedColumns: ["id"]
          },
        ]
      }
      eixos: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          cor?: string
          created_at?: string
          id?: string
          nome: string
          ordem: number
          updated_at?: string
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      jovens: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          patrulha: string | null
          perfil: string
          registro_ueb: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          patrulha?: string | null
          perfil?: string
          registro_ueb?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          patrulha?: string | null
          perfil?: string
          registro_ueb?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progresso_acoes: {
        Row: {
          acao_id: string
          created_at: string
          data_conclusao: string
          escoteiro_id: string
          id: string
          updated_at: string
          validado_por: string | null
        }
        Insert: {
          acao_id: string
          created_at?: string
          data_conclusao?: string
          escoteiro_id: string
          id?: string
          updated_at?: string
          validado_por?: string | null
        }
        Update: {
          acao_id?: string
          created_at?: string
          data_conclusao?: string
          escoteiro_id?: string
          id?: string
          updated_at?: string
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progresso_acoes_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: false
            referencedRelation: "acoes_catalogo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_acoes_escoteiro_id_fkey"
            columns: ["escoteiro_id"]
            isOneToOne: false
            referencedRelation: "jovens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_acoes_escoteiro_id_fkey"
            columns: ["escoteiro_id"]
            isOneToOne: false
            referencedRelation: "vw_status_blocos"
            referencedColumns: ["escoteiro_id"]
          },
        ]
      }
      promessas: {
        Row: {
          created_at: string
          id: string
          jovem_id: string
          liberada_em: string
          liberada_por: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jovem_id: string
          liberada_em?: string
          liberada_por?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jovem_id?: string
          liberada_em?: string
          liberada_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promessas_jovem_id_fkey"
            columns: ["jovem_id"]
            isOneToOne: true
            referencedRelation: "jovens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promessas_jovem_id_fkey"
            columns: ["jovem_id"]
            isOneToOne: true
            referencedRelation: "vw_status_blocos"
            referencedColumns: ["escoteiro_id"]
          },
        ]
      }
    }
    Views: {
      vw_status_blocos: {
        Row: {
          acao_ou_concluida: boolean | null
          atalho_conquistado: boolean | null
          bloco_concluido: boolean | null
          bloco_id: string | null
          bloco_nome: string | null
          escoteiro_id: string | null
          meta_variaveis: number | null
          todas_fixas_concluidas: boolean | null
          variaveis_concluidas: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
