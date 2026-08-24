"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

function requireConfig() {
  if (!isSupabaseConfigured) {
    throw new Error("التطبيق في Demo Mode. أضف مفاتيح Supabase في .env.local لتنفيذ العمليات فعليًا.");
  }
}

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  if (!user) redirect("/login");
  return { supabase: supabase!, userId: user.id };
}

async function logActivity(
  supabase: SupabaseServerClient,
  payload: {
    office_id: string;
    user_id?: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await supabase.from("activity_logs").insert({
    office_id: payload.office_id,
    user_id: payload.user_id ?? null,
    action: payload.action,
    entity_type: payload.entity_type ?? null,
    entity_id: payload.entity_id ?? null,
    metadata: payload.metadata ?? {},
  });
}

const optionalUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().uuid().nullable().optional(),
);

const optionalText = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().optional(),
);

const officeSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function createOffice(formData: FormData) {
  requireConfig();
  const parsed = officeSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("offices")
    .insert({ ...parsed, created_by: userId })
    .select("id, name")
    .single();

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: data.id,
    user_id: userId,
    action: "create_office",
    entity_type: "office",
    entity_id: data.id,
    metadata: { name: data.name },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

const clientSchema = z.object({
  office_id: z.string().uuid(),
  name: z.string().min(2),
  client_type: z.enum(["individual", "company"]),
  phone: optionalText,
  email: z.string().email().optional().or(z.literal("")),
  address: optionalText,
  tax_number: optionalText,
  registration_number: optionalText,
  notes: optionalText,
});

export async function createClientRecord(formData: FormData) {
  requireConfig();
  const parsed = clientSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...parsed, email: parsed.email || null })
    .select("id, name")
    .single();

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: parsed.office_id,
    user_id: userId,
    action: "create_client",
    entity_type: "client",
    entity_id: data.id,
    metadata: { name: data.name },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  redirect("/clients");
}

const updateClientSchema = clientSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["active", "inactive", "suspended", "archived"]),
});

export async function updateClientRecord(formData: FormData) {
  requireConfig();
  const parsed = updateClientSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();
  const { id, office_id, ...payload } = parsed;

  const { error } = await supabase
    .from("clients")
    .update({ ...payload, email: payload.email || null })
    .eq("id", id)
    .eq("office_id", office_id);

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id,
    user_id: userId,
    action: "update_client",
    entity_type: "client",
    entity_id: id,
    metadata: { name: payload.name, status: payload.status },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClientRecord(formData: FormData) {
  requireConfig();
  const id = z.string().uuid().parse(formData.get("id"));
  const officeId = z.string().uuid().parse(formData.get("office_id"));
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("clients").delete().eq("id", id).eq("office_id", officeId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, { office_id: officeId, user_id: userId, action: "delete_client", entity_type: "client", entity_id: id });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  redirect("/clients");
}

const serviceSchema = z.object({
  office_id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
});

export async function createService(formData: FormData) {
  requireConfig();
  const parsed = serviceSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase.from("services").insert(parsed).select("id, name").single();
  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: parsed.office_id,
    user_id: userId,
    action: "create_service",
    entity_type: "service",
    entity_id: data.id,
    metadata: { name: data.name },
  });

  revalidatePath("/services");
}

const updateServiceSchema = serviceSchema.extend({
  id: z.string().uuid(),
  is_active: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
});

export async function updateService(formData: FormData) {
  requireConfig();
  const parsed = updateServiceSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();
  const { id, office_id, ...payload } = parsed;

  const { error } = await supabase.from("services").update(payload).eq("id", id).eq("office_id", office_id);
  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id,
    user_id: userId,
    action: "update_service",
    entity_type: "service",
    entity_id: id,
    metadata: { name: payload.name, is_active: payload.is_active },
  });

  revalidatePath("/services");
  redirect("/services");
}

export async function deleteService(formData: FormData) {
  requireConfig();
  const id = z.string().uuid().parse(formData.get("id"));
  const officeId = z.string().uuid().parse(formData.get("office_id"));
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("services").delete().eq("id", id).eq("office_id", officeId);
  if (error) throw new Error("لا يمكن حذف الخدمة لو مرتبطة بعملاء. يمكنك تعطيلها من صفحة التعديل بدل الحذف.");
  await logActivity(supabase, { office_id: officeId, user_id: userId, action: "delete_service", entity_type: "service", entity_id: id });

  revalidatePath("/services");
}

const clientServiceSchema = z.object({
  office_id: z.string().uuid(),
  client_id: z.string().uuid(),
  service_id: z.string().uuid(),
  start_date: z.string().optional(),
  status: z.enum(["active", "paused", "completed", "cancelled"]).default("active"),
});

export async function assignServiceToClient(formData: FormData) {
  requireConfig();
  const parsed = clientServiceSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("client_services")
    .insert({ ...parsed, start_date: parsed.start_date || null })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: parsed.office_id,
    user_id: userId,
    action: "assign_service_to_client",
    entity_type: "client_service",
    entity_id: data.id,
    metadata: { client_id: parsed.client_id, service_id: parsed.service_id },
  });

  revalidatePath("/services");
  revalidatePath(`/clients/${parsed.client_id}`);
}

export async function updateClientServiceStatus(formData: FormData) {
  requireConfig();
  const id = z.string().uuid().parse(formData.get("id"));
  const officeId = z.string().uuid().parse(formData.get("office_id"));
  const status = z.enum(["active", "paused", "completed", "cancelled"]).parse(formData.get("status"));
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("client_services").update({ status }).eq("id", id).eq("office_id", officeId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: officeId,
    user_id: userId,
    action: "update_client_service_status",
    entity_type: "client_service",
    entity_id: id,
    metadata: { status },
  });

  revalidatePath("/services");
}

const taskSchema = z.object({
  office_id: z.string().uuid(),
  client_id: optionalUuid,
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "in_review", "completed", "cancelled", "blocked"]).optional(),
  due_date: z.string().optional(),
});

export async function createTask(formData: FormData) {
  requireConfig();
  const parsed = taskSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...parsed,
      status: parsed.status ?? "pending",
      client_id: parsed.client_id ?? null,
      due_date: parsed.due_date ? new Date(parsed.due_date).toISOString() : null,
      created_by: userId,
    })
    .select("id, title")
    .single();

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: parsed.office_id,
    user_id: userId,
    action: "create_task",
    entity_type: "task",
    entity_id: data.id,
    metadata: { title: data.title, client_id: parsed.client_id ?? null },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

const updateTaskSchema = taskSchema.extend({ id: z.string().uuid() });

export async function updateTask(formData: FormData) {
  requireConfig();
  const parsed = updateTaskSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();
  const { id, office_id, ...payload } = parsed;
  const status = payload.status ?? "pending";

  const { error } = await supabase
    .from("tasks")
    .update({
      ...payload,
      client_id: payload.client_id ?? null,
      status,
      due_date: payload.due_date ? new Date(payload.due_date).toISOString() : null,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("office_id", office_id);

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id,
    user_id: userId,
    action: "update_task",
    entity_type: "task",
    entity_id: id,
    metadata: { title: payload.title, status },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  requireConfig();
  const id = z.string().uuid().parse(formData.get("id"));
  const officeId = z.string().uuid().parse(formData.get("office_id"));
  const status = z.enum(["pending", "in_progress", "in_review", "completed", "cancelled", "blocked"]).parse(formData.get("status"));
  const { supabase, userId } = await getUserId();

  const { error } = await supabase
    .from("tasks")
    .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("office_id", officeId);

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: officeId,
    user_id: userId,
    action: "update_task_status",
    entity_type: "task",
    entity_id: id,
    metadata: { status },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  requireConfig();
  const id = z.string().uuid().parse(formData.get("id"));
  const officeId = z.string().uuid().parse(formData.get("office_id"));
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("office_id", officeId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, { office_id: officeId, user_id: userId, action: "delete_task", entity_type: "task", entity_id: id });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

const deadlineSchema = z.object({
  office_id: z.string().uuid(),
  client_id: optionalUuid,
  title: z.string().min(2),
  description: z.string().optional(),
  deadline_date: z.string().min(1),
  status: z.enum(["upcoming", "due_soon", "overdue", "completed", "cancelled"]).optional(),
});

export async function createDeadline(formData: FormData) {
  requireConfig();
  const parsed = deadlineSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("deadlines")
    .insert({
      ...parsed,
      client_id: parsed.client_id ?? null,
      status: parsed.status ?? "upcoming",
      deadline_date: new Date(parsed.deadline_date).toISOString(),
      created_by: userId,
    })
    .select("id, title")
    .single();

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: parsed.office_id,
    user_id: userId,
    action: "create_deadline",
    entity_type: "deadline",
    entity_id: data.id,
    metadata: { title: data.title, client_id: parsed.client_id ?? null },
  });

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
}

const updateDeadlineSchema = deadlineSchema.extend({ id: z.string().uuid() });

export async function updateDeadline(formData: FormData) {
  requireConfig();
  const parsed = updateDeadlineSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();
  const { id, office_id, ...payload } = parsed;
  const status = payload.status ?? "upcoming";

  const { error } = await supabase
    .from("deadlines")
    .update({
      ...payload,
      client_id: payload.client_id ?? null,
      status,
      deadline_date: new Date(payload.deadline_date).toISOString(),
    })
    .eq("id", id)
    .eq("office_id", office_id);

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id,
    user_id: userId,
    action: "update_deadline",
    entity_type: "deadline",
    entity_id: id,
    metadata: { title: payload.title, status },
  });

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
  redirect("/deadlines");
}

export async function updateDeadlineStatus(formData: FormData) {
  requireConfig();
  const id = z.string().uuid().parse(formData.get("id"));
  const officeId = z.string().uuid().parse(formData.get("office_id"));
  const status = z.enum(["upcoming", "due_soon", "overdue", "completed", "cancelled"]).parse(formData.get("status"));
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("deadlines").update({ status }).eq("id", id).eq("office_id", officeId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: officeId,
    user_id: userId,
    action: "update_deadline_status",
    entity_type: "deadline",
    entity_id: id,
    metadata: { status },
  });

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
}

export async function deleteDeadline(formData: FormData) {
  requireConfig();
  const id = z.string().uuid().parse(formData.get("id"));
  const officeId = z.string().uuid().parse(formData.get("office_id"));
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("deadlines").delete().eq("id", id).eq("office_id", officeId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, { office_id: officeId, user_id: userId, action: "delete_deadline", entity_type: "deadline", entity_id: id });

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
}

const invitationSchema = z.object({
  office_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "manager", "accountant", "reviewer", "staff"]),
});

export async function createInvitation(formData: FormData) {
  requireConfig();
  const parsed = invitationSchema.parse(Object.fromEntries(formData));
  const { supabase, userId } = await getUserId();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("office_invitations")
    .insert({ ...parsed, invited_by: userId, expires_at: expiresAt.toISOString() })
    .select("id, email, role")
    .single();

  if (error) throw new Error(error.message);
  await logActivity(supabase, {
    office_id: parsed.office_id,
    user_id: userId,
    action: "create_invitation",
    entity_type: "office_invitation",
    entity_id: data.id,
    metadata: { email: data.email, role: data.role },
  });

  revalidatePath("/staff");
}

export async function revokeInvitation(formData: FormData) {
  requireConfig();
  const id = z.string().uuid().parse(formData.get("id"));
  const officeId = z.string().uuid().parse(formData.get("office_id"));
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("office_invitations").update({ status: "revoked" }).eq("id", id).eq("office_id", officeId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, { office_id: officeId, user_id: userId, action: "revoke_invitation", entity_type: "office_invitation", entity_id: id });

  revalidatePath("/staff");
}

export async function acceptInvitation(formData: FormData) {
  requireConfig();
  const token = z.string().uuid().parse(formData.get("token"));
  const { supabase } = await getUserId();

  const { error } = await supabase.rpc("accept_office_invitation", { p_token: token });
  if (error) redirect(`/invite/${token}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
