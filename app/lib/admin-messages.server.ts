import { supabaseAdmin } from "./supabase.server";

export type AdminContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  emailSent: boolean;
  emailError: string | null;
  createdAt: string;
};

export async function listContactMessages(): Promise<AdminContactMessage[]> {
  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("id, name, email, message, email_sent, email_error, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los mensajes: ${error.message}`);

  return (data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    message: m.message,
    emailSent: m.email_sent,
    emailError: m.email_error,
    createdAt: m.created_at,
  }));
}
