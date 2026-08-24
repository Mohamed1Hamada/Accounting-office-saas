# نظام إدارة مكتب حماده امام

نظام داخلي لإدارة مكتب محاسبة واحد مبني بـ **Next.js + TypeScript + Tailwind CSS + Supabase**.

## المزايا الحالية

- تسجيل دخول/إنشاء حساب عبر Supabase Auth
- إنشاء مكتب حماده امام وإدارة بياناته
- إدارة العملاء مع بحث وفلترة
- إدارة الخدمات وربط الخدمة بالعميل
- إضافة/تعديل/حذف الخدمات
- إضافة/تعديل/حذف المهام وربطها بالعميل
- إضافة/تعديل/حذف المواعيد وربطها بالعميل
- رفع مستندات العملاء والبحث فيها
- إدارة الفريق والدعوات
- صفحة إدارة النظام `/admin`
- Activity Logs للعمليات المهمة
- صفحات Privacy و Terms
- تعليمات تجهيز SMTP باستخدام Resend داخل صفحة الإعدادات

## التشغيل المحلي

```bash
npm install
npm run dev
```

## Environment Variables

انسخ:

```bash
cp .env.local.example .env.local
```

ثم أضف:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## ملفات SQL

شغّل في Supabase SQL Editor بالترتيب:

1. `supabase_accounting_schema_reviewed.sql`
2. `supabase_production_addons.sql`

## النشر على Vercel

أضف نفس Environment Variables داخل Vercel، واجعل:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

ثم أضف الروابط في Supabase Auth URL Configuration:

```txt
https://your-domain.vercel.app/auth/callback
https://your-domain.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

## SMTP باستخدام Resend

لا تضف بيانات SMTP في الكود. الإعداد يتم من:

```txt
Supabase → Authentication → Emails → Set up SMTP
```

استخدم بيانات SMTP من Resend بعد توثيق الدومين.
# Accounting-office-saas
