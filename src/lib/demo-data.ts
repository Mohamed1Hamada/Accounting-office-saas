export const demoOffice = {
  id: "demo-office",
  name: "حماده امام",
  role: "owner",
};

export const demoStats = {
  clients: 18,
  activeTasks: 12,
  upcomingDeadlines: 5,
  documents: 47,
};

export const demoClients = [
  {
    id: "demo-client-1",
    name: "شركة الأمل للتجارة",
    client_type: "company",
    phone: "01000000000",
    email: "finance@alamal.test",
    tax_number: "123-456-789",
    status: "active",
    created_at: "2026-08-01T09:00:00Z",
  },
  {
    id: "demo-client-2",
    name: "د. أحمد مصطفى",
    client_type: "individual",
    phone: "01111111111",
    email: "ahmed@example.test",
    tax_number: null,
    status: "active",
    created_at: "2026-08-05T12:00:00Z",
  },
  {
    id: "demo-client-3",
    name: "مصنع السلام للصناعات الغذائية",
    client_type: "company",
    phone: "01222222222",
    email: "tax@alsalam.test",
    tax_number: "987-654-321",
    status: "active",
    created_at: "2026-08-10T10:30:00Z",
  },
];

export const demoServices = [
  { id: "s1", name: "إقرار ضريبة القيمة المضافة", is_active: true },
  { id: "s2", name: "إقرار ضريبة الدخل", is_active: true },
  { id: "s3", name: "تأسيس شركات", is_active: true },
  { id: "s4", name: "مراجعة حسابات", is_active: true },
];

export const demoTasks = [
  {
    id: "task-1",
    title: "مراجعة مستندات القيمة المضافة",
    client_name: "شركة الأمل للتجارة",
    status: "in_progress",
    priority: "high",
    due_date: "2026-08-27T10:00:00Z",
  },
  {
    id: "task-2",
    title: "تجهيز ملف الفحص الضريبي",
    client_name: "مصنع السلام للصناعات الغذائية",
    status: "pending",
    priority: "urgent",
    due_date: "2026-08-25T09:00:00Z",
  },
  {
    id: "task-3",
    title: "رفع عقد التأسيس",
    client_name: "د. أحمد مصطفى",
    status: "completed",
    priority: "medium",
    due_date: "2026-08-20T09:00:00Z",
  },
];

export const demoDeadlines = [
  {
    id: "d1",
    title: "آخر موعد إقرار القيمة المضافة",
    client_name: "شركة الأمل للتجارة",
    deadline_date: "2026-08-31T21:59:00Z",
    status: "upcoming",
  },
  {
    id: "d2",
    title: "جلسة فحص ضريبي",
    client_name: "مصنع السلام للصناعات الغذائية",
    deadline_date: "2026-09-03T08:00:00Z",
    status: "upcoming",
  },
];
