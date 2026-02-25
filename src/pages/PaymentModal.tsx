import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePOSStore } from '../stores/usePOSStore';
import { useQueueStore } from '../stores/useQueueStore';
import { db } from '../lib/db';
import { queueOperation } from '../lib/sync';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { X, CheckCircle, Wallet, CreditCard, Clock } from 'lucide-react';

interface PaymentModalProps {
  ticketId: string | null;
  onClose: () => void;
}

export function PaymentModal({ ticketId, onClose }: PaymentModalProps) {
  const { t } = useTranslation();
  const { total, items, customerId, employeeId, clearCart } = usePOSStore();
  const { fetchTickets } = useQueueStore();

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [amountReceived, setAmountReceived] = useState<number | ''>(total);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const change = (amountReceived as number) - total;

  const handleConfirm = async () => {
    if (paymentMethod === 'cash' && (amountReceived as number) < total) {
      alert(t('pos.insufficientAmount'));
      return;
    }

    if (!ticketId || !customerId) {
      alert("Erreur: Ticket ou Client manquant.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Update queue_tickets
      const currentTicket = await db.queue_tickets.get(ticketId);
      if (currentTicket) {
        await queueOperation('queue_tickets', 'UPDATE', {
          ...currentTicket,
          status: 'completed',
          payment_method: paymentMethod,
          paid_amount: paymentMethod === 'credit' ? 0 : total,
          completed_at: new Date().toISOString(),
        });
      }

      // 2. Fetch current customer
      const currentCust = await db.customers.get(customerId);
      const currentBalance = currentCust?.current_balance || 0;

      // 3. Handle Payment or Debt logic
      if (paymentMethod === 'credit') {
        const debtId = crypto.randomUUID();
        await queueOperation('debts', 'INSERT', {
          id: debtId,
          customer_id: customerId,
          ticket_id: ticketId,
          original_amount: total,
          paid_amount: 0,
          remaining_amount: total,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (currentCust) {
          await queueOperation('customers', 'UPDATE', {
            ...currentCust,
            current_balance: currentBalance + total,
            updated_at: new Date().toISOString()
          });
        }
      } else {
        if (currentCust) {
          await queueOperation('customers', 'UPDATE', {
            ...currentCust,
            current_balance: currentBalance + total,
            updated_at: new Date().toISOString()
          });
        }

        const paymentId = crypto.randomUUID();
        await queueOperation('payments', 'INSERT', {
          id: paymentId,
          ticket_id: ticketId,
          customer_id: customerId,
          amount: total,
          payment_method: paymentMethod,
          reference_number: referenceNumber || null,
          notes: notes,
          created_at: new Date().toISOString()
        });

        const txId = crypto.randomUUID();
        await queueOperation('financial_transactions', 'INSERT', {
          id: txId,
          type: 'revenue',
          amount: total,
          description: `Paiement Ticket #${ticketId.slice(0, 8)}`,
          reference_type: 'ticket',
          reference_id: ticketId,
          category: 'sales',
          created_at: new Date().toISOString(),
        });
      }

      // 4. Record ticket services & products and calculate commissions
      const services = items.filter(i => i.type === 'service');
      const products = items.filter(i => i.type === 'product');
      let totalCommissionsForTicket = 0;

      const employee = employeeId ? await db.employees.get(employeeId) : null;

      if (services.length > 0) {
        for (const s of services) {
          await queueOperation('ticket_services', 'INSERT', {
            id: crypto.randomUUID(),
            ticket_id: ticketId,
            service_id: s.id,
            quantity: s.quantity,
            unit_price: s.price,
            total_price: s.subtotal,
            employee_id: employeeId || null,
            created_at: new Date().toISOString()
          });

          // Calculate commission if an employee is assigned
          if (employee) {
            const serviceData = await db.services.get(s.id);
            let commissionAmount = 0;
            let rateApplied = 0;
            let method = 'percentage';

            if (serviceData) {
              if (serviceData.commission_fixed > 0) {
                commissionAmount = serviceData.commission_fixed * s.quantity;
                method = 'fixed';
                rateApplied = serviceData.commission_fixed;
              } else if (serviceData.commission_rate > 0) {
                commissionAmount = (s.subtotal * serviceData.commission_rate) / 100;
                rateApplied = serviceData.commission_rate;
              } else if (employee.commission_rate > 0) {
                commissionAmount = (s.subtotal * employee.commission_rate) / 100;
                rateApplied = employee.commission_rate;
              }
            }

            if (commissionAmount > 0) {
              totalCommissionsForTicket += commissionAmount;

              await queueOperation('commissions', 'INSERT', {
                id: crypto.randomUUID(),
                employee_id: employee.id,
                ticket_id: ticketId,
                service_id: s.id,
                amount: commissionAmount,
                calculation_method: method,
                rate_applied: rateApplied,
                paid: false,
                paid_at: null,
                paid_in_batch: null,
                notes: `Commission for ${s.name} (Qty: ${s.quantity})`,
                created_at: new Date().toISOString()
              });
            }
          }
        }
      }

      // 5. Update Employee commission balances
      if (employee && totalCommissionsForTicket > 0) {
        await queueOperation('employees', 'UPDATE', {
          ...employee,
          total_commissions: (employee.total_commissions || 0) + totalCommissionsForTicket,
          pending_commissions: (employee.pending_commissions || 0) + totalCommissionsForTicket,
          updated_at: new Date().toISOString()
        });
      }

      if (products.length > 0) {
        for (const p of products) {
          await queueOperation('ticket_products', 'INSERT', {
            id: crypto.randomUUID(),
            ticket_id: ticketId,
            product_id: p.id,
            quantity: p.quantity,
            unit_price: p.price,
            total_price: p.subtotal,
            created_at: new Date().toISOString()
          });
        }
      }

      // Refresh Queue Data
      await fetchTickets();

      clearCart();
      onClose();

    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Une erreur s'est produite lors de l'enregistrement de l'encaissement.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-lg)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary-500" />
            Règlement
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-panel)] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray">

          {/* Total Display */}
          <div className="p-6 bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-base)] border border-[var(--border)] rounded-2xl text-center shadow-inner relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-[20px]"></div>
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 relative z-10">Total à Payer</p>
            <p className="text-4xl font-black text-gradient relative z-10">{total.toLocaleString()} DZD</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wider">
              Mode de paiement
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${paymentMethod === 'cash'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-[var(--border-lg)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-white'
                  }`}
              >
                <Wallet className="w-5 h-5" />
                <span className="font-bold text-xs uppercase">Espèces</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${paymentMethod === 'card'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-[var(--border-lg)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-white'
                  }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-bold text-xs uppercase">Carte</span>
              </button>
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${paymentMethod === 'credit'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-[var(--border-lg)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-white'
                  }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-bold text-xs uppercase">Crédit</span>
              </button>
            </div>
          </div>

          {/* Conditional Inputs */}
          <div className="animate-fade-in p-4 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)]">
            {paymentMethod === 'cash' && (
              <Input
                label="Montant Reçu (DZD)"
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value === '' ? '' : parseFloat(e.target.value))}
                min={total}
                step="0.01"
              />
            )}

            {paymentMethod === 'card' && (
              <Input
                label="Numéro de reçu / transaction"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Ex: 8492"
              />
            )}

            {paymentMethod === 'credit' && (
              <div className="p-3 bg-warning-500/10 border border-warning-500/30 rounded-lg flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning-400 shrink-0 mt-0.5" />
                <p className="text-xs text-warning-400 font-medium leading-relaxed">
                  Cette transaction sera enregistrée comme dette sur le compte du client. Assurez-vous d'avoir l'accord préalable.
                </p>
              </div>
            )}
          </div>

          {/* Change Display */}
          {paymentMethod === 'cash' && change >= 0 && (
            <div className="flex items-center justify-between p-4 bg-success-500/10 border border-success-500/20 rounded-xl animate-fade-in">
              <span className="text-success-400 font-bold uppercase tracking-wider text-xs">Monnaie à rendre</span>
              <span className="text-xl font-black text-success-500">{change.toLocaleString()} DZD</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Commentaire / Notes (Optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-lg)] rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-white text-sm"
              placeholder="Ajouter une note de caisse..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[var(--border)] flex items-center gap-3 bg-[var(--bg-panel)]">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="success"
            className="flex-1 shadow-lg shadow-success-500/20"
            onClick={handleConfirm}
            isLoading={isProcessing}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Valider Encaissment</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
