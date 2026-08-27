export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: "mujer" | "hombre" | "accesorios";
          kind: string;
          price: number | null;
          compare_at: number | null;
          description: string | null;
          materials: string | null;
          badge: string | null;
          is_new: boolean;
          is_bestseller: boolean;
          is_on_sale: boolean;
          show_reduced_sizes_notice: boolean;
          is_draft: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "created_at"
        > & { created_at?: string };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          color_name: string;
          color_hex: string | null;
          size: "S" | "M" | "L" | "XL";
          stock: number;
          modelo: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["product_variants"]["Row"], "id" | "modelo"> & {
          id?: string;
          modelo?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          position: number;
          color_name: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["product_images"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      admins: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["admins"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admins"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          items: unknown;
          subtotal: number;
          shipping_fee: number;
          total: number;
          currency: string;
          status: "processing" | "shipped" | "delivered" | "cancelled";
          shipping_address: unknown;
          shipping_carrier: string | null;
          shipping_days: number | null;
          shipping_provider_name: string | null;
          shipping_service_code: string | null;
          skydropx_shipment_id: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
          label_url: string | null;
          stripe_session_id: string;
          discount_code: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "created_at" | "status"> & {
          created_at?: string;
          status?: Database["public"]["Tables"]["orders"]["Row"]["status"];
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      postal_codes: {
        Row: {
          id: number;
          postal_code: string;
          colonia: string;
          tipo_asentamiento: string | null;
          municipio: string;
          estado: string;
        };
        Insert: Omit<Database["public"]["Tables"]["postal_codes"]["Row"], "id"> & { id?: number };
        Update: Partial<Database["public"]["Tables"]["postal_codes"]["Insert"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          email_sent: boolean;
          email_error: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["contact_messages"]["Row"],
          "id" | "created_at" | "email_sent" | "email_error"
        > & {
          id?: string;
          created_at?: string;
          email_sent?: boolean;
          email_error?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
        Relationships: [];
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          color_name: string;
          size: "S" | "M" | "L" | "XL";
          type: "entrada" | "salida";
          quantity: number;
          concept: string;
          movement_date: string;
          resulting_stock: number;
          admin_id: string | null;
          admin_name: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["inventory_movements"]["Row"],
          "id" | "created_at" | "resulting_stock"
        > & {
          id?: string;
          created_at?: string;
          resulting_stock?: number;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_movements"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_counts: {
        Row: {
          id: string;
          product_id: string;
          color_name: string;
          size: "S" | "M" | "L" | "XL";
          system_stock: number;
          counted_stock: number;
          counted_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["inventory_counts"]["Row"],
          "id" | "counted_at" | "updated_at"
        > & {
          id?: string;
          counted_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_counts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "inventory_counts_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      discount_signups: {
        Row: {
          id: string;
          email: string;
          code: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["discount_signups"]["Row"],
          "id" | "used_at" | "created_at"
        > & {
          id?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["discount_signups"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      decrement_variant_stock: {
        Args: { p_variant_id: string; p_qty: number };
        Returns: number;
      };
      register_inventory_movement: {
        Args: {
          p_product_id: string;
          p_color_name: string;
          p_size: string;
          p_type: string;
          p_quantity: number;
          p_concept: string;
          p_movement_date: string;
          p_admin_id: string | null;
          p_admin_name: string;
        };
        Returns: Database["public"]["Tables"]["inventory_movements"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
