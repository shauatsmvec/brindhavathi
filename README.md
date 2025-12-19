# E-Trends Explorer

A modern, responsive Retail/Store Management ERP-Lite System built with React, TypeScript, and Tailwind CSS. This application provides comprehensive tools for managing inventory, sales, procurement, expenses, customers, suppliers, and analytics.

![E-Trends Explorer](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Module Overview](#-module-overview)
- [Design System](#-design-system)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Modules

- **📊 Dashboard** - Real-time KPIs, sales charts, inventory status, and recent transactions
- **📦 Inventory Management** - Product tracking, stock levels, low-stock alerts, and category filtering
- **🛒 Sales & Billing** - Invoice management, payment tracking, and revenue analytics
- **🚚 Procurement** - Purchase order management and supplier tracking
- **💰 Expense Tracking** - Categorized expenses with visual breakdowns
- **👥 Customer Management** - Customer profiles and purchase history
- **🏢 Supplier Management** - Supplier ratings and order history
- **📈 Analytics & Reports** - Revenue trends, profit analysis, and data visualization

### UI/UX Features

- 🌙 Professional dark theme with custom design tokens
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Modern glassmorphism effects
- ⚡ Smooth animations and transitions
- 📊 Interactive charts powered by Recharts

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev/) | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Vite](https://vitejs.dev/) | Build Tool |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [React Router](https://reactrouter.com/) | Navigation |
| [Recharts](https://recharts.org/) | Data Visualization |
| [Lucide React](https://lucide.dev/) | Icons |
| [Radix UI](https://www.radix-ui.com/) | Accessible Components |
| [TanStack Query](https://tanstack.com/query) | Data Fetching |

## 📁 Project Structure

```
e-trends-explorer/
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── placeholder.svg
├── src/
│   ├── components/
│   │   ├── dashboard/         # Dashboard-specific components
│   │   │   ├── InventoryStatus.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── TopProducts.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MobileSidebar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                # Reusable UI components (shadcn/ui)
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                   # Utility functions
│   │   └── utils.ts
│   ├── pages/                 # Page components
│   │   ├── Analytics.tsx
│   │   ├── Customers.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Expenses.tsx
│   │   ├── Inventory.tsx
│   │   ├── NotFound.tsx
│   │   ├── Procurement.tsx
│   │   ├── Sales.tsx
│   │   ├── Settings.tsx
│   │   └── Suppliers.tsx
│   ├── App.tsx                # Main app with routes
│   ├── App.css                # App-specific styles
│   ├── index.css              # Global styles & design system
│   ├── main.tsx               # App entry point
│   └── vite-env.d.ts          # Vite type declarations
├── .env.example               # Environment variables template
├── .gitignore
├── CHANGELOG.md               # Version history
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
├── README.md                  # This file
├── components.json            # shadcn/ui configuration
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML template
├── package.json               # Dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
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
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 📖 Module Overview

### Dashboard
The main landing page providing an overview of:
- Key performance indicators (Revenue, Orders, Products, Profit, Customers, Expenses)
- Sales trend chart (7-day overview)
- Inventory status breakdown
- Recent transactions
- Top-selling products

### Inventory Management
Comprehensive product management:
- Search and filter products by category
- View stock levels with low-stock indicators
- SKU tracking
- Cost and pricing information
- Status badges (In Stock, Low Stock, Out of Stock)

### Sales & Billing
Invoice and transaction management:
- Create and track invoices
- Filter by payment status (Paid, Pending, Overdue)
- Revenue summaries
- Payment method tracking
- Customer information

### Procurement
Purchase order and supplier management:
- Track purchase orders by status
- Supplier relationship management
- Expected delivery tracking
- Order totals and item counts
- Top supplier overview

### Expense Tracking
Operational expense management:
- Categorized expenses (Rent, Payroll, Marketing, etc.)
- Visual expense breakdown by category
- Quick expense entry form
- Budget tracking

### Customer Management
Customer relationship features:
- Customer directory with search
- Purchase history tracking
- Total spending per customer
- Last order tracking

### Supplier Management
Supplier relationship features:
- Supplier directory with ratings
- Order history
- Total business volume
- Contact information

### Analytics & Reports
Comprehensive data visualization:
- Revenue vs Expenses trends
- Profit analysis
- Sales by category breakdown
- Daily sales patterns
- Inventory trend analysis

### Settings
Application configuration:
- Store information
- User profile management
- Notification preferences
- Security settings
- Data management
- Appearance customization

## 🎨 Design System

### Color Palette

The application uses a professional dark theme with the following semantic colors:

| Token | Purpose | HSL Value |
|-------|---------|-----------|
| `--primary` | Main brand color (Teal) | `160 84% 39%` |
| `--accent` | Accent color (Amber) | `38 92% 50%` |
| `--success` | Positive indicators | `160 84% 39%` |
| `--warning` | Warning states | `38 92% 50%` |
| `--destructive` | Error/danger states | `0 72% 51%` |
| `--info` | Informational | `200 90% 50%` |

### Typography

- **Primary Font**: Inter (UI elements)
- **Monospace Font**: JetBrains Mono (code, IDs)

### Component Classes

Custom utility classes available:

```css
.glass-card     /* Glassmorphism card effect */
.stat-card      /* Statistics card with hover glow */
.data-table     /* Styled data tables */
.nav-link       /* Navigation link styling */
.chart-container /* Chart wrapper */
.badge-success  /* Success badge */
.badge-warning  /* Warning badge */
.badge-danger   /* Danger badge */
.input-field    /* Form input styling */
.btn-primary    /* Primary button */
.btn-secondary  /* Secondary button */
.btn-ghost      /* Ghost button */
```

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

- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Recharts](https://recharts.org/) - Composable charting library
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components

---

Built with ❤️ using [Lovable](https://lovable.dev)
