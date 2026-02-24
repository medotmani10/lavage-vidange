import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { QueueTicket, TicketStatus } from '../types';

interface QueueState {
  tickets: QueueTicket[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTickets: (status?: TicketStatus[]) => Promise<void>;
  subscribeToTickets: () => () => void;
  createTicket: (ticket: {
    customer_id: string;
    vehicle_id: string;
    priority?: 'normal' | 'priority' | 'vip';
    status?: TicketStatus;
    subtotal?: number;
    tax_rate?: number;
    discount?: number;
    total_amount?: number;
    paid_amount?: number;
    payment_method?: 'cash' | 'card' | 'credit' | 'mixed';
    notes?: string;
    assigned_employee_id?: string | null;
  }) => Promise<QueueTicket | null>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  updateTicketEmployee: (ticketId: string, employeeId: string | null) => Promise<void>;
  clearTickets: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  tickets: [],
  isLoading: false,
  error: null,

  fetchTickets: async (status) => {
    set({ isLoading: true, error: null });
    
    try {
      let query = supabase
        .from('queue_tickets')
        .select(`
          *,
          customer:customers (
            id,
            full_name,
            phone,
            email
          ),
          vehicle:vehicles (
            id,
            plate_number,
            brand,
            model,
            year
          ),
          employee:employees (
            id,
            position,
            user:users (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ tickets: data || [], isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tickets';
      set({ error: errorMessage, isLoading: false });
    }
  },

  subscribeToTickets: () => {
    const channel = supabase
      .channel('queue_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_tickets',
        },
        async () => {
          // Refresh tickets on any change
          await get().fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  createTicket: async (ticketData) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await (supabase
        .from('queue_tickets') as any)
        .insert([{
          customer_id: ticketData.customer_id,
          vehicle_id: ticketData.vehicle_id,
          priority: ticketData.priority || 'normal',
          status: ticketData.status || 'pending',
          subtotal: ticketData.subtotal || 0,
          tax_rate: ticketData.tax_rate || 0,
          discount: ticketData.discount || 0,
          total_amount: ticketData.total_amount || 0,
          paid_amount: ticketData.paid_amount || 0,
          payment_method: ticketData.payment_method,
          notes: ticketData.notes,
          assigned_employee_id: ticketData.assigned_employee_id,
        }])
        .select(`
          *,
          customer:customers (
            id,
            full_name,
            phone
          ),
          vehicle:vehicles (
            id,
            plate_number,
            brand,
            model
          )
        `)
        .single();

      if (error) throw error;

      // Refresh tickets list
      await get().fetchTickets();
      
      set({ isLoading: false });
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ticket';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    set({ isLoading: true, error: null });
    
    try {
      const updateData: any = { status };

      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await (supabase
        .from('queue_tickets') as any)
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      // Refresh tickets list
      await get().fetchTickets();
      
      set({ isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateTicketEmployee: async (ticketId, employeeId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await (supabase
        .from('queue_tickets') as any)
        .update({ assigned_employee_id: employeeId })
        .eq('id', ticketId);

      if (error) throw error;

      // Refresh tickets list
      await get().fetchTickets();
      
      set({ isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update employee';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearTickets: () => {
    set({ tickets: [], error: null });
  },
}));
