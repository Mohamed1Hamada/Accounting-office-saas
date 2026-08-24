"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env, isSupabaseConfigured } from "@/lib/env";

function requireSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error("ضيف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env.local الأول.");
  }
}

export async function signInWithPassword(formData: FormData) {
  requireSupabaseConfig();
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  requireSupabaseConfig();
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  const { error } = await supabase!.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${env.siteUrl}/auth/callback`,
    },
  });

  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);

  redirect(`/login?message=${encodeURIComponent("تم إنشاء الحساب. لو تفعيل البريد مفعّل في Supabase، افتح لينك التأكيد الأول.")}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
