export type ClientItem = {
  id: string;
  name: string;
  client_type?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  tax_number?: string | null;
  registration_number?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export type ServiceItem = {
  id: string;
  office_id?: string | null;
  name: string;
  description?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

export type ClientServiceItem = {
  id: string;
  office_id?: string | null;
  client_id: string;
  service_id: string;
  assigned_to?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  created_at?: string | null;
  client_name?: string | null;
  service_name?: string | null;
};

export type TaskItem = {
  id: string;
  office_id?: string | null;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  client_id?: string | null;
  client_name?: string | null;
};

export type DeadlineItem = {
  id: string;
  office_id?: string | null;
  title: string;
  description?: string | null;
  status?: string | null;
  deadline_date?: string | null;
  created_at?: string | null;
  client_id?: string | null;
  client_name?: string | null;
};

export type StaffMember = {
  id: string;
  user_id?: string | null;
  role?: string | null;
  status?: string | null;
  created_at?: string | null;
  profiles?: {
    full_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  } | null;
};

export type InvitationItem = {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  expires_at?: string | null;
  created_at?: string | null;
};

export type DocumentItem = {
  id: string;
  office_id: string;
  client_id: string;
  file_id?: string | null;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  uploaded_by?: string | null;
  created_at?: string | null;
  client_name?: string | null;
  uploaded_by_name?: string | null;
};

export type ActivityLogItem = {
  id: string;
  office_id: string;
  user_id?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  user_name?: string | null;
};
