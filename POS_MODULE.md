# POS Module - Phase 6 Documentation

## Overview

The Point of Sale (POS) module provides a complete sales interface for Lavage & Vidange stations. It allows workers to create tickets by selecting services and products, manage the shopping cart, and process payments.

## Features Implemented

### 1. Services Catalog
- **Grid Display**: Services shown in a 2-column grid
- **Search**: Filter services by name
- **Service Info**: Name, price, duration, commission rate
- **Quick Add**: Click to add service to cart

### 2. Products Catalog
- **Category Tabs**: All, Tires, Oils, Accessories, Other
- **Search**: Filter by name or SKU
- **Stock Display**: Shows current stock level
- **Low Stock Alert**: Highlights products below minimum stock
- **Product Info**: Name, brand, price, SKU, stock quantity

### 3. Shopping Cart
- **Item Management**: Add, remove, update quantities
- **Quantity Controls**: +/- buttons for quick adjustment
- **Auto-Calculate**: Subtotal, tax, discount, total
- **Discount Input**: Manual discount entry
- **Empty State**: Message when cart is empty

### 4. Customer & Vehicle Selection
- **Customer Dropdown**: Select from active customers
- **Balance Display**: Shows current balance and credit limit
- **Vehicle Dropdown**: Filtered by selected customer
- **Employee Assignment**: Assign ticket to worker

### 5. Payment Processing
- **Payment Methods**: Cash, Card, Credit
- **Cash Payment**: Amount received, change calculation
- **Card Payment**: Reference number entry
- **Credit Payment**: Warning about customer debt
- **Payment Confirmation**: Success modal

### 6. Checkout Flow
1. Select services/products
2. Choose customer and vehicle
3. Review cart totals
4. Click "Payer" (Checkout)
5. Select payment method
6. Confirm payment
7. Ticket created in queue

## File Structure

```
src/
├── pages/
│   ├── POS.tsx                  # Main POS page
│   ├── ServicesPanel.tsx        # Services catalog
│   ├── ProductsPanel.tsx        # Products catalog
│   ├── CartPanel.tsx            # Shopping cart
│   ├── CustomerSelect.tsx       # Customer/vehicle selector
│   └── PaymentModal.tsx         # Payment dialog
├── stores/
│   └── usePOSStore.ts           # Cart state management
└── locales/
    ├── fr.json                  # French POS translations
    └── ar.json                  # Arabic POS translations
```

## Components

### POS.tsx
Main page component with 2-column layout.

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  POS                        Subtotal    [Payer]         │
├─────────────────────────────┬────────────────────────────┤
│  [Services] [Products]      │  Customer Select           │
│  ┌─────────────────────┐    │  ┌──────────────────────┐  │
│  │ Services Grid       │    │  │ Customer Dropdown    │  │
│  │ or                  │    │  │ Vehicle Dropdown     │  │
│  │ Products Grid       │    │  │ Employee Dropdown    │  │
│  │                     │    │  └──────────────────────┘  │
│  │                     │    │                            │
│  │                     │    │  Cart                      │
│  │                     │    │  ┌──────────────────────┐  │
│  │                     │    │  │ Items List           │  │
│  │                     │    │  │ Totals               │  │
│  │                     │    │  │ Discount             │  │
│  │                     │    │  └──────────────────────┘  │
└─────────────────────────────┴────────────────────────────┘
```

### ServicesPanel.tsx
Services catalog with search.

**Features:**
- Fetches active services from database
- Bilingual name display (FR/AR)
- Shows duration and commission rate
- Click to add to cart

### ProductsPanel.tsx
Products catalog with categories.

**Features:**
- Category filter tabs
- Search by name or SKU
- Low stock highlighting
- Stock quantity display
- Brand information

### CartPanel.tsx
Shopping cart with quantity controls.

**Features:**
- Item list with +/- controls
- Remove item button
- Subtotal, tax, discount, total
- Discount input field
- Scrollable item list

### CustomerSelect.tsx
Customer, vehicle, and employee selection.

**Features:**
- Customer dropdown with balance info
- Vehicle dropdown (filtered by customer)
- Employee assignment
- Current balance and credit limit display

### PaymentModal.tsx
Payment processing dialog.

**Payment Methods:**
- **Cash**: Amount received, change calculation
- **Card**: Reference number entry
- **Credit**: Warning about debt addition

## State Management (usePOSStore)

### State
```typescript
{
  items: CartItem[];
  customerId: string | null;
  vehicleId: string | null;
  employeeId: string | null;
  notes: string;
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}
```

### CartItem Interface
```typescript
{
  id: string;
  type: 'service' | 'product';
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}
```

### Actions

#### `addItem(item)`
Adds item to cart. If item exists, increases quantity.

```typescript
addItem({
  id: 'uuid',
  type: 'service',
  name: 'Lavage Complet',
  price: 1500,
  quantity: 1,
});
```

#### `removeItem(itemId, type)`
Removes item from cart.

```typescript
removeItem('uuid', 'service');
```

#### `updateQuantity(itemId, type, quantity)`
Updates item quantity. Removes if quantity <= 0.

```typescript
updateQuantity('uuid', 'product', 2);
```

#### `clearCart()`
Resets cart to empty state.

#### `calculateTotals()`
Recalculates subtotal, tax, and total.

## Database Integration

### Tables Used
- `services` - Service catalog
- `products` - Product inventory
- `customers` - Customer selection
- `vehicles` - Vehicle selection
- `employees` - Employee assignment
- `queue_tickets` - Ticket creation

### Integration Flow
1. Load services/products on mount
2. Load customers for selection
3. Load vehicles based on customer
4. Create ticket on checkout
5. Clear cart after successful creation

## Usage Example

### Basic POS Route
```typescript
import { POS } from './pages/POS';

// In your router
<Route path="/pos" element={
  <ProtectedRoute>
    <POS />
  </ProtectedRoute>
} />
```

### Using POS Store
```typescript
import { usePOSStore } from './stores/usePOSStore';

function MyComponent() {
  const { addItem, subtotal, total, clearCart } = usePOSStore();
  
  const handleAddService = () => {
    addItem({
      id: 'service-uuid',
      type: 'service',
      name: 'Lavage',
      price: 1500,
      quantity: 1,
    });
  };
  
  return (
    <div>
      <button onClick={handleAddService}>Add Service</button>
      <p>Total: {total} DA</p>
    </div>
  );
}
```

## Translations

### French Keys
```json
{
  "pos": {
    "checkout": "Payer",
    "cart": "Panier",
    "cartEmpty": "Panier vide",
    "payment": "Paiement",
    "confirmPayment": "Confirmer le paiement"
  }
}
```

### Arabic Keys
```json
{
  "pos": {
    "checkout": "دفع",
    "cart": "السلة",
    "cartEmpty": "السلة فارغة",
    "payment": "الدفع",
    "confirmPayment": "تأكيد الدفع"
  }
}
```

## Future Enhancements

1. **Barcode Scanner**: USB/Bluetooth scanner support
2. **Receipt Printing**: Thermal printer integration
3. **Quick Keys**: Keyboard shortcuts for common actions
4. **Offline Mode**: LocalStorage for intermittent connectivity
5. **Split Payment**: Multiple payment methods per ticket
6. **Hold Cart**: Save cart for later
7. **Customer Display**: Secondary display for customers
8. **Sales History**: Quick lookup of past transactions

## Testing Checklist

### Manual Testing
- [ ] Add service to cart
- [ ] Add product to cart
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Apply discount
- [ ] Select customer
- [ ] Select vehicle
- [ ] Assign employee
- [ ] Process cash payment
- [ ] Process card payment
- [ ] Process credit payment
- [ ] Verify change calculation
- [ ] Verify ticket creation
- [ ] Cart clears after checkout
- [ ] Search services
- [ ] Search products
- [ ] Filter by category

## Known Limitations

1. **No Receipt Printing**: Payment confirmed but no receipt generated
2. **No Barcode Support**: Manual product selection only
3. **No Offline Mode**: Requires internet connection
4. **No Split Payment**: Single payment method per transaction
5. **No Price Override**: Prices from database only
6. **No Customer Creation**: Must pre-exist in database

## Performance Considerations

1. **Initial Load**: Services and products loaded on mount
2. **Real-time Updates**: Not implemented (could add Supabase subscriptions)
3. **Cart Persistence**: Cart lost on page refresh
4. **Large Catalogs**: May need pagination for 100+ items

## Next Steps

Continue with **Phase 7: CRM & Vehicle Management** which will add:
- Customer CRUD operations
- Vehicle garage management
- Customer history view
- Credit limit enforcement
- Loyalty points management
- Customer search and filters
