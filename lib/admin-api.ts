// Admin API client for BubbleBox backend
// Auth: x-admin-token header, token stored in localStorage
// All endpoints under /api/admin/* — see backend src/routes/admin.js

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

const TOKEN_KEY = "bba_admin_token";

// ─── Token helpers (browser only) ──────────────────────────
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setAdminToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Types ─────────────────────────────────────────────────
export interface AdminStats {
  today_bookings: number;
  yesterday_bookings: number;
  pending_applications: number;
  revenue_month_cents: number;
  revenue_last_month_cents: number;
  active_cleaners: number;
  generated_at: string;
}

export interface AdminBooking {
  id: string;
  customer_id: string;
  service_id: string;
  pro_id: string | null;
  zip: string;
  address_line: string | null;
  preferred_date: string;
  preferred_window: string | null;
  scheduled_start_at: string | null;
  notes: string | null;
  status: BookingStatus;
  estimated_total_cents: number | null;
  final_total_cents: number | null;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  promo_code: string | null;
  discount_cents: number;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  service_name: string | null;
  pro_name?: string | null;
  pro_phone?: string | null;
}

export type BookingStatus =
  | "requested"
  | "broadcasting"
  | "confirmed"
  | "enroute"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded";

export interface AdminApplication {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  service_zips: string;
  services: string;
  has_insurance: number;
  has_transportation: number;
  years_experience: string | null;
  status: ApplicationStatus;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  ip_address: string | null;
  user_agent?: string | null;
  agreements_json?: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  stripe_customer_id?: string | null;
  created_at: string;
  booking_count: number;
  spent_cents: number;
}

export interface AdminCustomerDetail extends AdminCustomer {
  bookings: AdminBooking[];
}

export interface AdminPro {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string | null;
  zip_codes: string;
  services: string;
  avg_rating: number;
  completed_jobs: number;
  background_check_status: string;
  application_status: string;
  sms_opted_out: number;
  created_at: string;
}

export interface AdminProDetail extends AdminPro {
  recent_bookings: Array<{
    id: string;
    preferred_date: string;
    status: BookingStatus;
    final_total_cents: number | null;
    customer_name: string | null;
  }>;
}

export interface ApproveApplicationResponse {
  pro_id: string;
  supabase_user_id: string;
  email: string;
  full_name: string;
  message: string;
}

export interface PaginatedResponse<K extends string, T> {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Array<{ path: string; message: string }>;
}

export class AdminApiError extends Error {
  code: string;
  status: number;
  details?: Array<{ path: string; message: string }>;
  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

// ─── Fetch helper ──────────────────────────────────────────
async function adminFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();
  if (!token) {
    throw new AdminApiError(401, {
      code: "no_token",
      message: "No admin token. Sign in again.",
    });
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "x-admin-token": token,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const err: ApiErrorBody = body.error ?? {
      code: "unknown_error",
      message: "Something went wrong",
    };
    throw new AdminApiError(res.status, err);
  }
  return body as T;
}

// ─── Endpoints ─────────────────────────────────────────────
export function fetchStats() {
  return adminFetch<AdminStats>("/api/admin/stats");
}

export function fetchBookings(params: {
  status?: BookingStatus | "all";
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";
  return adminFetch<{ bookings: AdminBooking[]; total: number; limit: number; offset: number }>(
    `/api/admin/bookings${suffix}`
  );
}

export function fetchBooking(id: string) {
  return adminFetch<AdminBooking>(`/api/admin/bookings/${id}`);
}

export function updateBooking(
  id: string,
  patch: { status?: BookingStatus; notes?: string; pro_id?: string | null; scheduled_start_at?: string | null }
) {
  return adminFetch<AdminBooking>(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function fetchApplications(params: {
  status?: ApplicationStatus | "all";
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";
  return adminFetch<{ applications: AdminApplication[]; total: number; limit: number; offset: number }>(
    `/api/admin/applications${suffix}`
  );
}

export function fetchApplication(id: string) {
  return adminFetch<AdminApplication>(`/api/admin/applications/${id}`);
}

export function updateApplication(
  id: string,
  patch: { status?: ApplicationStatus; review_notes?: string }
) {
  return adminFetch<AdminApplication>(`/api/admin/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// Approves an application: creates Supabase user, creates pros row, sends invite email.
// Use this instead of updateApplication({ status: "approved" }) when you want the full flow.
export async function approveApplication(id: string, review_notes?: string): Promise<ApproveApplicationResponse> {
  const wrapped = await adminFetch<{ data: ApproveApplicationResponse }>(
    `/api/admin/pro-applications/${id}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ review_notes: review_notes ?? null }),
    }
  );
  return wrapped.data;
}
export function fetchCustomers(params: { q?: string; limit?: number; offset?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";
  return adminFetch<{ customers: AdminCustomer[]; total: number; limit: number; offset: number }>(
    `/api/admin/customers${suffix}`
  );
}

export function fetchCustomer(id: string) {
  return adminFetch<AdminCustomerDetail>(`/api/admin/customers/${id}`);
}

export function fetchPros(params: { status?: string; q?: string; limit?: number; offset?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";
  return adminFetch<{ pros: AdminPro[]; total: number; limit: number; offset: number }>(
    `/api/admin/pros${suffix}`
  );
}

export function fetchPro(id: string) {
  return adminFetch<AdminProDetail>(`/api/admin/pros/${id}`);
}

// ─── Format helpers ────────────────────────────────────────
export function fmtCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
