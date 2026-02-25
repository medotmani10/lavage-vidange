import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/db';
import { queueOperation } from '../lib/sync';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Car, Edit2, Trash2, X } from 'lucide-react';

interface Vehicle {
  id: string;
  customer_id: string;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  odometer: number;
  vin?: string;
  color?: string;
  customer?: {
    full_name: string;
    phone: string;
  };
}

export function Vehicles() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const customerIdFilter = searchParams.get('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const vehiclesData = useLiveQuery(async () => {
    const allVehicles = await db.vehicles.toArray();

    // Resolve customer names manually for offline support
    const resolvedVehicles = await Promise.all(allVehicles.map(async (v) => {
      const customer = await db.customers.get(v.customer_id);
      return {
        ...v,
        customer: customer ? { full_name: customer.full_name, phone: customer.phone } : undefined
      };
    }));

    return resolvedVehicles.sort((a, b) => a.plate_number.localeCompare(b.plate_number));
  });

  const customers = useLiveQuery(async () => {
    const all = await db.customers.toArray();
    return all.filter(c => c.active !== false)
      .map(c => ({ id: c.id, full_name: c.full_name }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }) || [];

  const isLoading = vehiclesData === undefined;
  const vehicles = vehiclesData as Vehicle[] || [];

  const filteredVehicles = vehicles.filter((vehicle) => {
    // If a customer filter is present via URL, apply it first
    if (customerIdFilter && vehicle.customer_id !== customerIdFilter) {
      return false;
    }

    const query = searchQuery.toLowerCase();
    return (
      vehicle.plate_number.toLowerCase().includes(query) ||
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.customer?.full_name.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm(t('messages.deleteConfirm'))) return;

    await queueOperation('vehicles', 'DELETE', { id });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('navigation.vehicles')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">
            {filteredVehicles.length} {t('vehicles.total')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {customerIdFilter && (
            <Button variant="secondary" onClick={() => {
              searchParams.delete('customer');
              setSearchParams(searchParams);
            }}>
              Afficher toutes les voitures
              <X className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          )}
          <Button onClick={() => {
            setEditingVehicle(null);
            setShowModal(true);
          }}>
            <Plus className="w-5 h-5 mr-2" />
            {t('vehicle.addVehicle')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-2 border-[var(--border-lg)] bg-[var(--bg-panel)] shadow-sm">
        <Input
          type="text"
          placeholder={t('vehicles.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5 text-gray-400" />}
          className="bg-[var(--bg-base)] border-none"
        />
      </Card>

      {/* Vehicles Table / Display */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-[var(--text-muted)]">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="font-medium animate-pulse">{t('common.loading')}</p>
          </div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-[var(--border-lg)] bg-[var(--bg-panel)]/50">
          <Car className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <p className="text-[var(--text-secondary)] font-medium text-lg">{t('common.noData')}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 border-[var(--border)]">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-panel)] border-b border-[var(--border)] uppercase text-[10px] tracking-wider text-[var(--text-secondary)] font-bold">
                  <th className="px-6 py-4">{t('vehicle.plateNumber')}</th>
                  <th className="px-6 py-4">{t('vehicle.brand')} & {t('vehicle.model')}</th>
                  <th className="px-6 py-4">{t('vehicle.year')}</th>
                  <th className="px-6 py-4">{t('vehicle.odometer')}</th>
                  <th className="px-6 py-4">{t('customer.customer')}</th>
                  <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-[var(--bg-hover)] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm font-bold bg-[var(--bg-base)] px-2 py-1 rounded inline-block border border-[var(--border)] text-white group-hover:border-primary-500/30">
                        {vehicle.plate_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-white text-sm">{vehicle.brand}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{vehicle.model}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)] font-medium">
                      {vehicle.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)] font-medium">
                      {vehicle.odometer.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-white text-sm">{vehicle.customer?.full_name}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono">{vehicle.customer?.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingVehicle(vehicle);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors border border-transparent hover:border-primary-500/30"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4 text-primary-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-2 hover:bg-danger-500/10 rounded-lg transition-colors border border-transparent hover:border-danger-500/30"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-danger-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <VehicleModal
          vehicle={editingVehicle}
          customers={customers}
          onClose={() => {
            setShowModal(false);
            setEditingVehicle(null);
          }}
        />
      )}
    </div>
  );
}

interface VehicleModalProps {
  vehicle: Vehicle | null;
  customers: { id: string; full_name: string }[];
  onClose: () => void;
}

function VehicleModal({ vehicle, customers, onClose }: VehicleModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    customer_id: vehicle?.customer_id || '',
    plate_number: vehicle?.plate_number || '',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year?.toString() || new Date().getFullYear().toString(),
    odometer: vehicle?.odometer?.toString() || '0',
    vin: vehicle?.vin || '',
    color: vehicle?.color || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      ...formData,
      year: parseInt(formData.year) || new Date().getFullYear(),
      odometer: parseInt(formData.odometer) || 0,
    };

    try {
      if (vehicle) {
        await queueOperation('vehicles', 'UPDATE', { ...vehicle, ...data, updated_at: new Date().toISOString() });
      } else {
        await queueOperation('vehicles', 'INSERT', {
          id: crypto.randomUUID(),
          ...data,
          created_at: new Date().toISOString()
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert(t('messages.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.full_name,
  }));

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear + 1; y >= currentYear - 20; y--) {
    yearOptions.push({ value: y.toString(), label: y.toString() });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-lg)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[var(--border)] shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-primary-500" />
            {vehicle ? t('vehicle.editVehicle') : t('vehicle.addVehicle')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray">
          <Select
            label={t('customer.customer')}
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            options={[
              { value: '', label: t('customer.selectCustomer') },
              ...customerOptions,
            ]}
            required
          />

          <Input
            label={t('vehicle.plateNumber')}
            value={formData.plate_number}
            onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
            placeholder="12345-ABC-19"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('vehicle.brand')}
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Toyota"
              required
            />

            <Input
              label={t('vehicle.model')}
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Corolla"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('vehicle.year')}
              value={formData.year.toString()}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              options={yearOptions}
              required
            />

            <Input
              label={t('vehicle.odometer')}
              type="number"
              value={formData.odometer}
              onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
              placeholder="50000"
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('vehicle.vin')}
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              placeholder="VF1..."
            />

            <Input
              label={t('vehicle.color')}
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Gris"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)] mt-6">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isLoading}
            >
              {vehicle ? t('common.save') : t('common.add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
