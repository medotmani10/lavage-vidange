import { useTranslation } from 'react-i18next';
import { usePOSStore } from '../stores/usePOSStore';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Input } from '../components/Input';

export function CartPanel() {
  const { t } = useTranslation();
  const { items, subtotal, taxAmount, discount, total, removeItem, updateQuantity, setDiscount } = usePOSStore();

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscount(value);
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-[var(--text-muted)] opacity-70">
        <ShoppingBag className="w-12 h-12 mb-4" />
        <p className="text-lg font-bold">Panier Vide</p>
        <p className="text-sm mt-1">Ajoutez des services ou produits pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-surface)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] shrink-0 flex justify-between items-center bg-[var(--bg-panel)]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary-500" />
          {t('pos.cart')}
        </h2>
        <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-[var(--shadow-glow-orange)]">
          {items.length} {t('pos.items')}
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-3 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-lg)] group transition-all hover:border-[var(--text-muted)]">
            <div className="flex-1 min-w-0 pr-2">
              <p className="font-bold text-[13px] text-white truncate w-full" title={item.name}>{item.name}</p>
              <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5">
                {item.price} DZD × <span className="text-white">{item.quantity}</span>
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[var(--bg-base)] p-1 rounded-lg border border-[var(--border)] shrink-0">
              <button
                onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                className="p-1 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-white rounded transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-white shrink-0">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                className="p-1 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-white rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id, item.type)}
              className="p-2 hover:bg-danger-500/20 text-[var(--text-muted)] hover:text-danger-400 rounded-lg transition-colors shrink-0 border border-transparent hover:border-danger-500/30 ml-1"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="text-right min-w-[70px] shrink-0">
              <p className="font-extrabold text-[13px] text-primary-500">{item.subtotal.toLocaleString()} DZD</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Summary */}
      <div className="border-t border-[var(--border)] p-4 space-y-3 bg-[var(--bg-panel)] shrink-0 mt-auto">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-xs">Sous-total</span>
          <span className="font-bold text-white">{subtotal.toLocaleString()} DZD</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-xs">Taxe (0%)</span>
          <span className="font-bold text-white">{taxAmount.toLocaleString()} DZD</span>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-[var(--border-lg)]">
          <span className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-xs whitespace-nowrap">
            Remise
          </span>
          <Input
            type="number"
            value={discount || ''}
            onChange={handleDiscountChange}
            className="w-28 text-right bg-[var(--bg-base)] h-8 text-sm px-2 font-mono"
            placeholder="0 DZD"
            min="0"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <span className="text-white font-black uppercase text-sm tracking-wide">Total TTC</span>
          <span className="text-2xl font-black text-gradient">{total.toLocaleString()} DZD</span>
        </div>
      </div>
    </div>
  );
}
