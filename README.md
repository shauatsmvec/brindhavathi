# E-Trends Explorer

A modern, responsive Retail/Store Management ERP-Lite System built with React, TypeScript, Tailwind CSS, and Supabase. This application provides comprehensive tools for managing inventory, sales, procurement, expenses, customers, suppliers, and analytics with robust security features.

![E-Trends Explorer](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue) ![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## 📋 Table of Contents

- [Features](#-features)
- [Security Features](#-security-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Modules

- **📊 Dashboard** - Real-time KPIs, sales charts, inventory status, and recent transactions
- **📦 Inventory Management** - Product tracking, stock levels, low-stock alerts, and category filtering
- **🛒 Sales & Billing** - Invoice management, payment tracking, and revenue analytics
- **🚚 Procurement** - Purchase order management and supplier tracking (Admin only)
- **💰 Expense Tracking** - Categorized expenses with visual breakdowns (Admin only)
- **👥 Customer Management** - Customer profiles and purchase history
- **🏢 Supplier Management** - Supplier ratings and order history
- **📈 Analytics & Reports** - Revenue trends, profit analysis, and data visualization
- **⚙️ Settings** - Store configuration, user management, and system preferences (Admin only)
- **👤 User Profile** - Personal analytics and performance metrics (Regular users)

### UI/UX Features

- 🌙 Professional dark theme with custom design tokens
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Modern glassmorphism effects
- ⚡ Smooth animations and transitions
- 📊 Interactive charts powered by Recharts

## 🔐 Security Features

### Authentication
- **Email/Password Authentication** - Secure sign-up and login
- **Security Questions** - 3 mandatory questions during registration for password recovery
- **No Email Links** - Password reset via security question verification

### Session Security
- **Session-Based Auth** - Tokens stored in sessionStorage
- **Tab Isolation** - Session invalidated on tab switch
- **Auto-Logout** - 30-minute inactivity timeout
- **Refresh Protection** - Re-login required on page refresh

### Database Security
- **Row Level Security (RLS)** - All tables protected with RLS policies
- **Role-Based Access** - Server-side role verification
- **Separate Roles Table** - Prevents privilege escalation attacks

## 👥 User Roles

### Administrator
| Module | Access Level |
|--------|--------------|
| Dashboard | Full Access |
| Inventory | Full CRUD |
| Sales | Full CRUD |
| Suppliers | Full CRUD |
| Customers | Full CRUD |
| Expenses | Full CRUD |
| Procurement | Full CRUD |
| Analytics | View |
| Settings | Full Access |
| User Management | Full CRUD (edit names, passwords, roles, delete users) |

### Regular User
| Module | Access Level |
|--------|--------------|
| Dashboard | View |
| Inventory | View Only |
| Sales | Full CRUD |
| Suppliers | View Only |
| Customers | Full CRUD |
| Analytics | View |
| User Profile | View & Edit Own |

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev/) | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Vite](https://vitejs.dev/) | Build Tool |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Supabase](https://supabase.com/) | Backend (Auth, Database, Edge Functions) |
| [React Router](https://reactrouter.com/) | Navigation |
| [TanStack Query](https://tanstack.com/query) | Data Fetching |
| [Recharts](https://recharts.org/) | Data Visualization |
| [Radix UI](https://www.radix-ui.com/) | Accessible Components |

## 📁 Project Structure

```
e-trends-explorer/
├── docs/                      # Project documentation
│   └── PROJECT_DOCUMENTATION.md
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── layout/            # Layout components
│   │   ├── settings/          # Settings components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.tsx        # Authentication hook
│   │   └── use-mobile.tsx
│   ├── integrations/          # Supabase integration
│   ├── lib/                   # Utility functions
│   └── pages/                 # Page components
├── supabase/
│   ├── functions/             # Edge functions
│   │   └── admin-manage-users/
│   └── migrations/            # Database migrations
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, yarn, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/e-trends-explorer.git
   cd e-trends-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Setting Up Admin User

After creating your first user, run this SQL query in your database:
```sql
UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';
```

## 📖 Documentation

For detailed project documentation including:
- Complete database schema
- Security implementation details
- Authentication flows
- API reference
- Feature specifications

See [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Recharts](https://recharts.org/) - Composable charting library
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components

---


