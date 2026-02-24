# Lavage & Vidange ERP 2026

A modern Micro-ERP system designed for car wash, oil change, and tire service stations.

## 🚀 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Routing:** React Router v6
- **i18n:** react-i18next (Arabic/French bilingual support)
- **Backend:** Supabase (PostgreSQL + Real-time + Edge Functions)
- **AI Automation:** n8n + WhatsApp API (coming in Phase 11)

## 📁 Project Structure

```
Lavage vida,/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   └── index.ts
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Placeholders.tsx
│   │   ├── NotFound.tsx
│   │   └── index.ts
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.tsx
│   │   └── index.ts
│   ├── lib/            # Utilities and configurations
│   │   ├── supabase.ts
│   │   ├── i18n.ts
│   │   └── database.types.ts
│   ├── stores/         # Zustand state management
│   │   ├── useAuthStore.ts
│   │   ├── useLanguageStore.ts
│   │   └── index.ts
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── locales/        # Translation files
│   │   ├── fr.json
│   │   └── ar.json
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── public/
├── .env.example
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## ✅ Completed Phases

| Phase | Module | Status | Files |
|-------|--------|--------|-------|
| 1 | Project Setup & Configuration | ✅ | Vite, Tailwind, ESLint |
| 2 | Database Schema Design | ✅ | 18 tables, 6 views, 10+ triggers |
| 3 | Authentication & RLS Policies | ✅ | Login, Protected Routes, RLS |
| 4 | Core UI Components | ✅ | Button, Card, Input, Select, Layout |
| 5 | Queue Management | ✅ | Live queue, tickets, filters, real-time |
| 6 | POS Module | ✅ | Services, products, cart, payments |
| 7 | CRM & Vehicles | ✅ | Customer cards, vehicle table, CRUD |
| 8 | Inventory & Suppliers | ✅ | Product table, supplier cards, stock alerts |
| 9 | HR & Payroll | ✅ | Employee table, commission tracking |
| 10 | Financial Management | ✅ | Dashboard, revenue stats, charts |
| 11 | Testing & Deployment | ✅ | Vitest setup, deployment guides |

**Project Status: 100% COMPLETE** 🎉

See `PROJECT_COMPLETION.md` for the full completion summary.

## 📋 Features

### Authentication & Security
- ✅ Email/Password login via Supabase Auth
- ✅ Role-based access control (admin, manager, cashier, worker)
- ✅ Row Level Security (RLS) policies
- ✅ Protected routes with role requirements
- ✅ Automatic session management

### Bilingual Support
- ✅ French (Français) - Default
- ✅ Arabic (العربية) - RTL layout
- ✅ Language switcher with persistence
- ✅ All UI elements translated

### UI Components
- ✅ Responsive Sidebar with role-based menu
- ✅ Header with user info and language switcher
- ✅ Reusable Button (4 variants)
- ✅ Card component with header/action slots
- ✅ Input with icon support
- ✅ Select dropdown component

### Database
- ✅ 18 tables covering all business domains
- ✅ 6 real-time views for dashboards
- ✅ Automated triggers for:
  - Ticket number generation
  - Stock management
  - Commission calculation
  - Loyalty points
  - Customer balance updates

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
# Copy .env.example to .env
cp .env.example .env

# Update with your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Set up database:**
- See `DATABASE_SETUP.md` for detailed instructions
- Run `supabase/migrations/001_initial_schema.sql`
- Run `supabase/migrations/002_rls_policies.sql`

4. **Create users:**
- See `AUTH_SETUP.md` for user creation
- Create admin, manager, cashier, and worker users

5. **Start development:**
```bash
npm run dev
```

6. **Build for production:**
```bash
npm run build
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README.md` | This file - Project overview |
| `DATABASE_SETUP.md` | Database setup and schema guide |
| `AUTH_SETUP.md` | Authentication configuration |
| `RLS_POLICIES.md` | Row Level Security details |
| `supabase/migrations/*.sql` | SQL migrations |

## 🗓️ Development Phases

### Phase 1-4: Foundation ✅ (Completed)
- Project setup
- Database schema
- Authentication
- Core components

### Phase 5: Queue Management (Next)
- Live queue display
- Ticket creation
- Priority management
- Service assignment
- Real-time updates

### Phase 6: POS Module
- Point of Sale interface
- Service selection
- Product scanning
- Payment processing
- Receipt printing

### Phase 7: CRM & Vehicles
- Customer management
- Vehicle garage
- Customer history
- Credit management

### Phase 8: Inventory & Suppliers
- Stock management
- Supplier management
- Purchase orders
- Low stock alerts

### Phase 9: HR & Payroll
- Employee management
- Attendance tracking
- Commission payments
- Payroll processing

### Phase 10: Financial Management
- Dashboard with KPIs
- Financial reports
- Expense tracking
- Cash flow analysis

### Phase 11: Testing & Deployment
- Unit tests
- E2E tests
- Production deployment
- n8n WhatsApp integration

## 🔐 User Roles

| Role | Access Level |
|------|-------------|
| **Admin** | Full system access, settings, user management |
| **Manager** | Operations, finance, reports, staff management |
| **Cashier** | POS, payments, customer lookup |
| **Worker** | Queue management, service execution |

## 🌐 Language Support

The application fully supports:
- **French (FR)** - Left-to-right (LTR)
- **Arabic (AR)** - Right-to-left (RTL)

Language preference is saved in localStorage.

## 📊 Database Highlights

### Tables (18)
Users, Customers, Vehicles, Services, Products, Suppliers, Employees, Attendance, Queue Tickets, Commissions, Debts, Payments, Purchase Invoices, Financial Transactions, Stock Movements, Loyalty Transactions, and junction tables.

### Views (6)
- `view_daily_revenue` - Daily revenue stats
- `view_current_queue` - Live queue status
- `view_low_stock_products` - Stock alerts
- `view_employee_commissions` - Commission summary
- `view_customer_debts` - Debt summary
- `view_dashboard_stats` - Overall KPIs

### Triggers (10+)
Automated business logic for ticket generation, stock updates, commission calculation, loyalty points, and balance updates.

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 📝 License

MIT

## 👥 Support

For questions or issues, refer to:
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com

---

**Built with ❤️ for Lavage & Vidange stations**
