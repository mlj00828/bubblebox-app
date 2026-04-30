// API client for the BubbleBox backend at api.homeproatl.xyz
// Uses backend's EXACT field names (verified during workflow integration):
//   service_id, zip, preferred_date, preferred_window, address_line, customer{}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

export interface CreateBookingPayload {
  service_id: string;
  zip: string;
  preferred_date: string; // YYYY-MM-DD
  preferred_window: "morning" | "afternoon" | "evening" | "anytime";
  address_line: string;
  notes?: string;
  customer: {
    name: string;
    phone: string; // E.164 format e.g. +14045551234
    email?: string;
  };
}

export interface BookingResponse {
  id: string;
  status: string;
  zip: string;
  address_line: string;
  preferred_date: string;
  preferred_window: string;
  notes: string | null;
  estimated_total_cents: number;
  final_total_cents: number | null;
  payment_status: string;
  service_id: string;
  service_name: string;
  service_icon: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  pro_id: string | null;
  pro_name: string | null;
  pro_phone: string | null;
  message: string;
  created_at: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ path: string; message: string }>;
}

export class BookingError extends Error {
  code: string;
  details?: Array<{ path: string; message: string }>;

  constructor(error: ApiError) {
    super(error.message);
    this.code = error.code;
    this.details = error.details;
  }
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<BookingResponse> {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  if (!res.ok) {
    const err: ApiError = body.error ?? {
      code: "unknown_error",
      message: "Something went wrong. Please try again.",
    };
    throw new BookingError(err);
  }

  return body.data as BookingResponse;
}

export async function fetchBooking(
  id: string,
  customerPhone: string
): Promise<BookingResponse | null> {
  const url = new URL(`${API_BASE}/api/bookings/${id}`);
  url.searchParams.set("phone", customerPhone);

  const res = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) {
    throw new Error(`Backend returned ${res.status}`);
  }

  const body = await res.json();
  return body.data as BookingResponse;
}

// Format a US phone like "(404) 747-7296" or "404-747-7296" or "4047477296"
// into E.164 +14047477296 (or null if invalid).
export function toE164USPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

// Display format like (404) 747-7296
export function formatPhoneForDisplay(input: string): string {
  const digits = input.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return input;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
