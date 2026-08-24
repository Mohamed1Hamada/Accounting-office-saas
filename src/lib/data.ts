import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  demoClients,
  demoDeadlines,
  demoOffice,
  demoServices,
  demoStats,
  demoTasks,
} from "@/lib/demo-data";
import type {
  ActivityLogItem,
  ClientItem,
  ClientServiceItem,
  DeadlineItem,
  DocumentItem,
  InvitationItem,
  ServiceItem,
  StaffMember,
  TaskItem,
} from "@/lib/types";

export type OfficeContext = {
  demoMode: boolean;
  user: { id: string; email?: string | null } | null;
  office: { id: string; name: string; role?: string | null } | null;
};

type EmbeddedClientName = { clients?: { name?: string | null } | null };
type EmbeddedProfileName = { profiles?: { full_name?: string | null } | null };
type EmbeddedServiceName = { services?: { name?: string | null } | null };

function normalizeSearch(value?: string | null) {
  return value?.trim().replace(/[,%]/g, "") || "";
}

export function canManageSystem(role?: string | null) {
  return role === "owner" || role === "admin";
}

export const getOfficeContext = cache(
  async function getOfficeContext(): Promise<OfficeContext> {
    if (!isSupabaseConfigured) {
      return { demoMode: true, user: null, office: demoOffice };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase!.auth.getUser();

    if (!user) redirect("/login");

    const { data: memberships } = await supabase!
      .from("office_members")
      .select("role, offices(id, name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1);

    const first = memberships?.[0] as
      | { role?: string; offices?: { id: string; name: string } | null }
      | undefined;

    return {
      demoMode: false,
      user: { id: user.id, email: user.email },
      office: first?.offices
        ? { id: first.offices.id, name: first.offices.name, role: first.role }
        : null,
    };
  },
);
export async function getDashboardData(officeId?: string | null): Promise<{
  stats: typeof demoStats;
  clients: ClientItem[];
  tasks: TaskItem[];
  deadlines: DeadlineItem[];
}> {
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    return {
      stats: demoStats,
      clients: demoClients,
      tasks: demoTasks,
      deadlines: demoDeadlines,
    };
  }

  const supabase = await createClient();

  const [
    clients,
    activeTasks,
    upcomingDeadlines,
    documents,
    recentClients,
    recentTasks,
    deadlines,
  ] = await Promise.all([
    supabase!
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("office_id", officeId),
    supabase!
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("office_id", officeId)
      .neq("status", "completed"),
    supabase!
      .from("deadlines")
      .select("id", { count: "exact", head: true })
      .eq("office_id", officeId)
      .in("status", ["upcoming", "due_soon", "overdue"]),
    supabase!
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("office_id", officeId),
    supabase!
      .from("clients")
      .select(
        "id, name, client_type, phone, email, tax_number, status, created_at",
      )
      .eq("office_id", officeId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase!
      .from("tasks")
      .select(
        "id, office_id, client_id, title, status, priority, due_date, clients(name)",
      )
      .eq("office_id", officeId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase!
      .from("deadlines")
      .select(
        "id, office_id, client_id, title, status, deadline_date, clients(name)",
      )
      .eq("office_id", officeId)
      .order("deadline_date", { ascending: true })
      .limit(6),
  ]);

  const taskRows = (recentTasks.data ?? []) as unknown as Array<
    TaskItem & EmbeddedClientName
  >;
  const deadlineRows = (deadlines.data ?? []) as unknown as Array<
    DeadlineItem & EmbeddedClientName
  >;

  return {
    stats: {
      clients: clients.count ?? 0,
      activeTasks: activeTasks.count ?? 0,
      upcomingDeadlines: upcomingDeadlines.count ?? 0,
      documents: documents.count ?? 0,
    },
    clients: (recentClients.data ?? []) as ClientItem[],
    tasks: taskRows.map((task) => ({
      ...task,
      client_name: task.clients?.name ?? null,
    })),
    deadlines: deadlineRows.map((deadline) => ({
      ...deadline,
      client_name: deadline.clients?.name ?? null,
    })),
  };
}

export async function getClients(
  officeId?: string | null,
  search?: string | null,
): Promise<ClientItem[]> {
  const q = normalizeSearch(search);
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    if (!q) return demoClients;
    return demoClients.filter((client) =>
      [client.name, client.email, client.phone, client.tax_number]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q.toLowerCase())),
    );
  }

  const supabase = await createClient();
  let query = supabase!
    .from("clients")
    .select(
      "id, name, client_type, phone, email, address, tax_number, registration_number, status, notes, created_at",
    )
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,tax_number.ilike.%${q}%,registration_number.ilike.%${q}%`,
    );
  }

  const { data } = await query;
  return (data ?? []) as ClientItem[];
}

export async function getClient(
  officeId: string,
  clientId: string,
): Promise<ClientItem | null> {
  if (!isSupabaseConfigured || officeId === "demo-office") {
    return (
      demoClients.find((client) => client.id === clientId) ?? demoClients[0]
    );
  }

  const supabase = await createClient();
  const { data } = await supabase!
    .from("clients")
    .select("*")
    .eq("office_id", officeId)
    .eq("id", clientId)
    .single();
  return data as ClientItem | null;
}

export async function getServices(
  officeId?: string | null,
  search?: string | null,
): Promise<ServiceItem[]> {
  const q = normalizeSearch(search);
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    if (!q) return demoServices;
    return demoServices.filter((service) =>
      service.name.toLowerCase().includes(q.toLowerCase()),
    );
  }

  const supabase = await createClient();
  let query = supabase!
    .from("services")
    .select("id, office_id, name, description, is_active, created_at")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });

  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

  const { data } = await query;
  return (data ?? []) as ServiceItem[];
}

export async function getService(
  officeId: string,
  serviceId: string,
): Promise<ServiceItem | null> {
  if (!isSupabaseConfigured || officeId === "demo-office") {
    return (
      demoServices.find((service) => service.id === serviceId) ??
      demoServices[0]
    );
  }

  const supabase = await createClient();
  const { data } = await supabase!
    .from("services")
    .select("*")
    .eq("office_id", officeId)
    .eq("id", serviceId)
    .single();
  return data as ServiceItem | null;
}

export async function getTasks(
  officeId?: string | null,
  search?: string | null,
): Promise<TaskItem[]> {
  const q = normalizeSearch(search);
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    if (!q) return demoTasks;
    return demoTasks.filter((task) =>
      [task.title, task.client_name, task.status].some((value) =>
        String(value ?? "").includes(q),
      ),
    );
  }

  const supabase = await createClient();
  let query = supabase!
    .from("tasks")
    .select(
      "id, office_id, client_id, title, description, status, priority, due_date, completed_at, created_at, clients(name)",
    )
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });

  if (q)
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,status.ilike.%${q}%`,
    );

  const { data } = await query;
  const taskRows = (data ?? []) as unknown as Array<
    TaskItem & EmbeddedClientName
  >;

  return taskRows.map((task) => ({
    ...task,
    client_name: task.clients?.name ?? null,
  }));
}

export async function getTask(
  officeId: string,
  taskId: string,
): Promise<TaskItem | null> {
  if (!isSupabaseConfigured || officeId === "demo-office")
    return demoTasks.find((task) => task.id === taskId) ?? demoTasks[0];

  const supabase = await createClient();
  const { data } = await supabase!
    .from("tasks")
    .select(
      "id, office_id, client_id, title, description, status, priority, due_date, completed_at, created_at, clients(name)",
    )
    .eq("office_id", officeId)
    .eq("id", taskId)
    .single();

  const row = data as unknown as (TaskItem & EmbeddedClientName) | null;
  return row ? { ...row, client_name: row.clients?.name ?? null } : null;
}

export async function getDeadlines(
  officeId?: string | null,
  search?: string | null,
): Promise<DeadlineItem[]> {
  const q = normalizeSearch(search);
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    if (!q) return demoDeadlines;
    return demoDeadlines.filter((deadline) =>
      [deadline.title, deadline.client_name, deadline.status].some((value) =>
        String(value ?? "").includes(q),
      ),
    );
  }

  const supabase = await createClient();
  let query = supabase!
    .from("deadlines")
    .select(
      "id, office_id, client_id, title, description, status, deadline_date, created_at, clients(name)",
    )
    .eq("office_id", officeId)
    .order("deadline_date", { ascending: true });

  if (q)
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,status.ilike.%${q}%`,
    );

  const { data } = await query;
  const deadlineRows = (data ?? []) as unknown as Array<
    DeadlineItem & EmbeddedClientName
  >;

  return deadlineRows.map((deadline) => ({
    ...deadline,
    client_name: deadline.clients?.name ?? null,
  }));
}

export async function getDeadline(
  officeId: string,
  deadlineId: string,
): Promise<DeadlineItem | null> {
  if (!isSupabaseConfigured || officeId === "demo-office")
    return (
      demoDeadlines.find((deadline) => deadline.id === deadlineId) ??
      demoDeadlines[0]
    );

  const supabase = await createClient();
  const { data } = await supabase!
    .from("deadlines")
    .select(
      "id, office_id, client_id, title, description, status, deadline_date, created_at, clients(name)",
    )
    .eq("office_id", officeId)
    .eq("id", deadlineId)
    .single();

  const row = data as unknown as (DeadlineItem & EmbeddedClientName) | null;
  return row ? { ...row, client_name: row.clients?.name ?? null } : null;
}

export async function getStaff(
  officeId?: string | null,
): Promise<StaffMember[]> {
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    return [
      {
        id: "1",
        role: "owner",
        status: "active",
        profiles: { full_name: "مالك المكتب", phone: "01000000000" },
      },
      {
        id: "2",
        role: "accountant",
        status: "active",
        profiles: { full_name: "محاسب أول", phone: "01111111111" },
      },
    ];
  }

  const supabase = await createClient();
  const { data } = await supabase!
    .from("office_members")
    .select(
      "id, user_id, role, status, created_at, profiles(full_name, phone, avatar_url)",
    )
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as StaffMember[];
}

export async function getDocuments(
  officeId?: string | null,
  filters?: { search?: string | null; clientId?: string | null },
): Promise<DocumentItem[]> {
  const q = normalizeSearch(filters?.search);
  const clientId = filters?.clientId?.trim() || "";

  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    const docs: DocumentItem[] = [
      {
        id: "doc-1",
        office_id: "demo-office",
        client_id: "demo-client-1",
        file_name: "إقرار القيمة المضافة - أغسطس.pdf",
        file_path: "demo-office/demo-client-1/vat-august.pdf",
        file_type: "application/pdf",
        file_size: 245760,
        created_at: "2026-08-18T10:00:00Z",
        client_name: "شركة الأمل للتجارة",
        uploaded_by_name: "مالك المكتب",
      },
    ];
    return docs.filter(
      (doc) =>
        (!q ||
          doc.file_name.includes(q) ||
          String(doc.client_name ?? "").includes(q)) &&
        (!clientId || doc.client_id === clientId),
    );
  }

  const supabase = await createClient();
  let query = supabase!
    .from("documents")
    .select(
      "id, office_id, client_id, file_id, file_name, file_path, file_type, file_size, uploaded_by, created_at, clients(name), profiles(full_name)",
    )
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);
  if (q) query = query.or(`file_name.ilike.%${q}%,file_type.ilike.%${q}%`);

  const { data } = await query;
  const rows = (data ?? []) as unknown as Array<
    DocumentItem & EmbeddedClientName & EmbeddedProfileName
  >;

  return rows.map((document) => ({
    ...document,
    client_name: document.clients?.name ?? null,
    uploaded_by_name: document.profiles?.full_name ?? null,
  }));
}

export async function getInvitations(
  officeId?: string | null,
): Promise<InvitationItem[]> {
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    return [
      {
        id: "invite-demo-1",
        email: "reviewer@example.com",
        role: "reviewer",
        status: "pending",
        token: "00000000-0000-0000-0000-000000000000",
        created_at: "2026-08-20T10:00:00Z",
      },
    ];
  }

  const supabase = await createClient();
  const { data } = await supabase!
    .from("office_invitations")
    .select("id, email, role, status, token, expires_at, created_at")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });

  return (data ?? []) as InvitationItem[];
}

export async function getClientServices(
  officeId?: string | null,
  clientId?: string | null,
): Promise<ClientServiceItem[]> {
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    return [
      {
        id: "client-service-demo-1",
        office_id: "demo-office",
        client_id: clientId ?? "demo-client-1",
        service_id: "s1",
        service_name: "إقرار ضريبة القيمة المضافة",
        client_name: "شركة الأمل للتجارة",
        status: "active",
        start_date: "2026-08-01",
        created_at: "2026-08-01T09:00:00Z",
      },
    ];
  }

  const supabase = await createClient();
  let query = supabase!
    .from("client_services")
    .select(
      "id, office_id, client_id, service_id, assigned_to, start_date, end_date, status, created_at, clients(name), services(name)",
    )
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data } = await query;
  const rows = (data ?? []) as unknown as Array<
    ClientServiceItem & EmbeddedClientName & EmbeddedServiceName
  >;

  return rows.map((row) => ({
    ...row,
    client_name: row.clients?.name ?? null,
    service_name: row.services?.name ?? null,
  }));
}

export async function getActivityLogs(
  officeId?: string | null,
  limit = 50,
): Promise<ActivityLogItem[]> {
  if (!isSupabaseConfigured || !officeId || officeId === "demo-office") {
    return [
      {
        id: "log-1",
        office_id: "demo-office",
        action: "create_client",
        entity_type: "client",
        entity_id: "demo-client-1",
        metadata: { name: "شركة الأمل للتجارة" },
        created_at: "2026-08-24T10:00:00Z",
        user_name: "مالك المكتب",
      },
    ];
  }

  const supabase = await createClient();
  const { data } = await supabase!
    .from("activity_logs")
    .select(
      "id, office_id, user_id, action, entity_type, entity_id, metadata, created_at, profiles(full_name)",
    )
    .eq("office_id", officeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as unknown as Array<
    ActivityLogItem & EmbeddedProfileName
  >;

  return rows.map((row) => ({
    ...row,
    user_name: row.profiles?.full_name ?? null,
  }));
}
