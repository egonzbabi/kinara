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
          price: number;
          compare_at: number | null;
          description: string | null;
          materials: string | null;
          badge: string | null;
          is_new: boolean;
          is_bestseller: boolean;
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
          stripe_session_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "created_at" | "status"> & {
          created_at?: string;
          status?: Database["public"]["Tables"]["orders"]["Row"]["status"];
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      decrement_variant_stock: {
        Args: { p_variant_id: string; p_qty: number };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
