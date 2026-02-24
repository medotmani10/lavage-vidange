# Queue Management Module - Phase 5 Documentation

## Overview

The Queue Management module is the core operational feature of the Lavage & Vidange ERP system. It provides real-time tracking of service tickets with a Kanban-style board showing pending, in-progress, and completed tickets.

## Features Implemented

### 1. Live Queue Display
- **3-Column Kanban Board**: Pending, In Progress, Completed
- **Real-time Updates**: Supabase real-time subscriptions
- **Ticket Cards**: Show customer, vehicle, priority, wait time, employee
- **Status Badges**: Color-coded by status and priority

### 2. Ticket Management
- **Add to Queue**: Create new tickets with customer/vehicle selection
- **Priority Levels**: Normal, Priority, VIP
- **Employee Assignment**: Assign tickets to workers
- **Status Transitions**: Start, Complete, Cancel
- **Search & Filter**: By status, priority, customer name, plate number

### 3. Ticket Card Features
- **Wait Time Display**: Shows how long ticket has been in queue
- **Priority Highlighting**: VIP tickets have red border
- **Quick Actions**: Start/Complete/Cancel buttons
- **Employee Display**: Shows assigned worker name
- **Amount Display**: Shows total if set

## File Structure

```
src/
├── pages/
│   ├── Queue.tsx              # Main queue page component
│   ├── TicketCard.tsx         # Individual ticket card
│   ├── TicketFilters.tsx      # Search and filter controls
│   └── AddTicketModal.tsx     # Modal for creating tickets
├── stores/
│   └── useQueueStore.ts       # Zustand store for queue state
└── locales/
    ├── fr.json                # French translations (queue keys)
    └── ar.json                # Arabic translations (queue keys)
```

## Components

### Queue.tsx
Main page component that displays the queue board.

**Features:**
- Fetches tickets on mount
- Subscribes to real-time updates
- Filters tickets by status/priority/search
- Groups tickets into 3 columns
- Shows add ticket modal

### TicketCard.tsx
Individual ticket display component.

**Props:**
- `ticket`: QueueTicket object
- `onUpdateStatus`: Callback to change ticket status

**Display:**
- Ticket number (#YYYYMMDD-0001)
- Customer name
- Vehicle info (brand, model, plate)
- Priority badge (Normal/Priority/VIP)
- Status badge (Pending/In Progress/Completed/Cancelled)
- Wait time (e.g., "15m" or "1h 30m")
- Assigned employee name
- Total amount
- Action buttons based on status

### TicketFilters.tsx
Filter and search controls.

**Props:**
- `selectedStatus`: Current status filter
- `onStatusChange`: Status filter callback
- `selectedPriority`: Current priority filter
- `onPriorityChange`: Priority filter callback
- `searchQuery`: Current search text
- `onSearchChange`: Search callback

**Filters:**
- Status: All, Pending, In Progress, Completed, Cancelled
- Priority: All, Normal, Priority, VIP
- Search: Customer name, plate number, ticket number

### AddTicketModal.tsx
Modal dialog for creating new tickets.

**Fields:**
- Customer (dropdown, required)
- Vehicle (dropdown, required, filtered by customer)
- Employee (dropdown, optional)
- Priority (dropdown: Normal/Priority/VIP)
- Total Amount (number input)
- Notes (textarea)

**Features:**
- Cascading customer/vehicle selection
- Employee list from database
- Form validation
- Loading state during creation

## State Management (useQueueStore)

### State
```typescript
{
  tickets: QueueTicket[];
  isLoading: boolean;
  error: string | null;
}
```

### Actions

#### `fetchTickets(status?)`
Fetches tickets from database, optionally filtered by status.

```typescript
await fetchTickets(['pending', 'in_progress']);
```

#### `subscribeToTickets()`
Subscribes to real-time updates via Supabase.

```typescript
const unsubscribe = subscribeToTickets();
// Returns cleanup function
```

#### `createTicket(ticketData)`
Creates a new ticket.

```typescript
const ticket = await createTicket({
  customer_id: 'uuid',
  vehicle_id: 'uuid',
  priority: 'vip',
  total_amount: 3500,
  assigned_employee_id: 'uuid',
});
```

#### `updateTicketStatus(ticketId, status)`
Updates ticket status.

```typescript
await updateTicketStatus('ticket-uuid', 'in_progress');
```

#### `updateTicketEmployee(ticketId, employeeId)`
Assigns employee to ticket.

```typescript
await updateTicketEmployee('ticket-uuid', 'employee-uuid');
```

## Database Integration

### Tables Used
- `queue_tickets` - Main tickets table
- `customers` - Customer info (joined)
- `vehicles` - Vehicle info (joined)
- `employees` - Employee assignment (joined)
- `users` - Employee names (joined through employees)

### Triggers Used
- `generate_ticket_number()` - Auto-generates ticket number
- `update_ticket_totals()` - Calculates totals
- `update_stock_on_ticket_complete()` - Decrements stock
- `create_commission_on_ticket_complete()` - Creates commission

## Usage Example

### Basic Queue Page
```typescript
import { Queue } from './pages/Queue';

// In your router
<Route path="/queue" element={
  <ProtectedRoute>
    <Queue />
  </ProtectedRoute>
} />
```

### Using Queue Store
```typescript
import { useQueueStore } from './stores/useQueueStore';

function MyComponent() {
  const { tickets, fetchTickets, createTicket } = useQueueStore();
  
  useEffect(() => {
    fetchTickets();
  }, []);
  
  return (
    <div>
      {tickets.map(ticket => (
        <div key={ticket.id}>{ticket.ticket_number}</div>
      ))}
    </div>
  );
}
```

## Translations

### French (fr.json)
```json
{
  "queue": {
    "currentQueue": "File d'attente actuelle",
    "addToQueue": "Ajouter à la file",
    "inProgress": "En cours",
    "start": "Démarrer",
    "completeService": "Terminer le service",
    "priority": {
      "normal": "Normal",
      "priority": "Prioritaire",
      "vip": "VIP"
    }
  }
}
```

### Arabic (ar.json)
```json
{
  "queue": {
    "currentQueue": "طابور الانتظار الحالي",
    "addToQueue": "إضافة إلى الطابور",
    "inProgress": "قيد التنفيذ",
    "start": "بدء",
    "completeService": "إنهاء الخدمة",
    "priority": {
      "normal": "عادي",
      "priority": "مستعجل",
      "vip": "في آي بي"
    }
  }
}
```

## Future Enhancements (Phase 6+)

1. **Service Selection**: Add specific services to tickets
2. **Product Scanning**: Scan barcodes for products
3. **Payment Integration**: Process payments in queue
4. **Print Tickets**: Thermal printer support
5. **Queue Analytics**: Wait time statistics
6. **SMS Notifications**: Notify customers when ready
7. **Drag & Drop**: Move tickets between columns

## Testing

### Manual Testing Checklist
- [ ] Create ticket with customer/vehicle
- [ ] Assign employee to ticket
- [ ] Start ticket (pending → in progress)
- [ ] Complete ticket (in progress → completed)
- [ ] Cancel ticket (pending → cancelled)
- [ ] Search by customer name
- [ ] Search by plate number
- [ ] Filter by priority
- [ ] Real-time updates work
- [ ] VIP border displays correctly
- [ ] Wait time updates correctly

## Known Limitations

1. **Type Safety**: Using `as any` for Supabase queries due to strict types
2. **No Service Selection**: Services not yet integrated
3. **No Product Management**: Products added manually
4. **No Payment Processing**: Amount set manually
5. **No Print Support**: Ticket printing not implemented

## Next Steps

Continue with **Phase 6: POS Module** which will add:
- Service catalog selection
- Product barcode scanning
- Payment processing
- Receipt printing
- Cash/Card/Credit payment methods
