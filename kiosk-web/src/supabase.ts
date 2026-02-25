import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Ticket {
    id: string;
    ticket_number: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    customer?: { full_name: string };
}

export interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
    active: boolean;
}
