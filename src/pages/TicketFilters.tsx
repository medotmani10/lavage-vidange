import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import type { TicketStatus, TicketPriority } from '../types';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

interface TicketFiltersProps {
  selectedStatus: TicketStatus | 'all';
  onStatusChange: (status: TicketStatus | 'all') => void;
  selectedPriority: TicketPriority | 'all';
  onPriorityChange: (priority: TicketPriority | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TicketFilters({
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  searchQuery,
  onSearchChange,
}: TicketFiltersProps) {
  const { t } = useTranslation();

  const statusOptions: { value: TicketStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('common.all') },
    { value: 'pending', label: t('common.pending') },
    { value: 'in_progress', label: t('queue.inProgress') },
    { value: 'completed', label: t('common.completed') },
    { value: 'cancelled', label: t('common.cancelled') },
  ];

  const priorityOptions: { value: TicketPriority | 'all'; label: string }[] = [
    { value: 'all', label: t('common.all') },
    { value: 'normal', label: t('queue.priority.normal') },
    { value: 'priority', label: t('queue.priority.priority') },
    { value: 'vip', label: t('queue.priority.vip') },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-[var(--bg-surface)] p-4 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)]">
      {/* Search */}
      <div className="w-full md:flex-1">
        <Input
          type="text"
          placeholder={t('queue.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="h-10 text-sm"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Status Filter */}
        <div className="flex-1 md:w-48">
          <Select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as TicketStatus | 'all')}
            options={statusOptions}
            className="h-10 text-sm py-2"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex-1 md:w-48">
          <Select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as TicketPriority | 'all')}
            options={priorityOptions}
            className="h-10 text-sm py-2"
          />
        </div>
      </div>
    </div>
  );
}
