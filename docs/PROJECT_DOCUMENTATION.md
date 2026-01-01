# E-Trends Explorer - Project Documentation

## College Project Assessment Document

**Project Title:** E-Trends Explorer - Inventory & Sales Management System  
**Technology Stack:** React, TypeScript, Tailwind CSS, Supabase  
**Project Type:** Web-Based Business Management Application

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Objectives](#project-objectives)
3. [System Architecture](#system-architecture)
4. [Features & Modules](#features--modules)
5. [Database Design](#database-design)
6. [Security Implementation](#security-implementation)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Authentication Flow](#authentication-flow)
9. [Technical Specifications](#technical-specifications)
10. [Screenshots & UI](#screenshots--ui)
11. [Future Enhancements](#future-enhancements)
12. [Conclusion](#conclusion)

---

## 1. Executive Summary

E-Trends Explorer is a comprehensive inventory and sales management system designed for small to medium-sized retail businesses. The application provides a complete solution for managing products, suppliers, customers, sales invoices, expenses, and business analytics.

The system implements Role-Based Access Control (RBAC) with two distinct user types: Administrators and Regular Users, each with specific permissions and access levels.

---

## 2. Project Objectives

### Primary Objectives
- Develop a user-friendly inventory management system
- Implement secure authentication with enhanced security features
- Create role-based access control for different user types
- Provide comprehensive analytics and reporting capabilities
- Enable efficient supplier and customer management

### Secondary Objectives
- Implement session-based security with auto-logout
- Create data export and backup functionality
- Develop a responsive design for all device types
- Integrate Python code execution capabilities

---

## 3. System Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                            │
│  ├── Layout Components (Header, Sidebar, DashboardLayout)   │
│  ├── UI Components (Button, Input, Dialog, Table, etc.)     │
│  ├── Page Components (Dashboard, Inventory, Sales, etc.)    │
│  └── Feature Components (Charts, Forms, Modals)             │
├─────────────────────────────────────────────────────────────┤
│  State Management                                            │
│  ├── React Query (Server State)                              │
│  ├── React Context (Auth State)                              │
│  └── Local State (Component State)                           │
├─────────────────────────────────────────────────────────────┤
│  Routing (React Router v6)                                   │
│  └── Protected Routes with Role-Based Access                 │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture (Supabase)
```
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Backend                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication Service                                      │
│  ├── Email/Password Authentication                           │
│  ├── Session Management                                      │
│  └── Security Questions for Password Recovery                │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)                                       │
│  ├── Products, Categories, Suppliers                         │
│  ├── Customers, Invoices, Invoice Items                      │
│  ├── Expenses, Expense Categories                            │
│  ├── User Profiles, User Roles                               │
│  └── Store Settings, Notification Preferences                │
├─────────────────────────────────────────────────────────────┤
│  Edge Functions                                              │
│  └── Admin User Management (CRUD operations)                 │
├─────────────────────────────────────────────────────────────┤
│  Row Level Security (RLS)                                    │
│  └── Fine-grained access control on all tables               │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Features & Modules

### 4.1 Dashboard Module
- **Overview Statistics**: Total revenue, orders, products, customers
- **Sales Chart**: Visual representation of sales trends
- **Recent Transactions**: Latest invoice activity
- **Top Products**: Best-selling items
- **Inventory Status**: Stock level indicators

### 4.2 Inventory Management
- Product catalog with SKU, pricing, and stock levels
- Category-based organization
- Low stock alerts and notifications
- **Admin Only**: Add, edit, and delete products

### 4.3 Sales & Invoicing
- Invoice creation with multiple line items
- Customer selection and management
- Payment method tracking
- Invoice status management (pending, paid, cancelled)
- **User Profile Analytics**: Individual user invoice statistics

### 4.4 Supplier Management
- Supplier contact information
- Rating system
- Order history tracking
- **Admin Only**: Add, edit, and delete suppliers

### 4.5 Customer Management
- Customer database with contact details
- Purchase history tracking
- Total orders and spending analytics

### 4.6 Expense Tracking
- Expense categorization
- Payment method logging
- Date-based filtering
- **Admin Only Access**

### 4.7 Procurement
- Purchase order creation
- Supplier integration
- Expected delivery tracking
- **Admin Only Access**

### 4.8 Analytics
- Revenue trends
- Sales performance metrics
- Inventory analytics
- Customer insights

### 4.9 Settings (Admin Only)
- **Store Information**: Business name, email, address
- **User Profile**: Name and account details
- **Notifications**: Alert preferences
- **Security**: Password management
- **Data Management**: Export and backup
- **Appearance**: Theme and accent color
- **User Management**: Manage all system users

### 4.10 User Profile (Regular Users)
- Personal statistics
- Invoice count and revenue contribution
- Weekly performance charts
- Invoice status distribution

### 4.11 Python Integration
- Custom Python code execution interface
- External authentication bridge
- Redirect to main application

---

## 5. Database Design

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │     │ user_roles  │     │  auth.users │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK/FK)  │────▶│ user_id(FK) │◀────│ id (PK)     │
│ full_name   │     │ role        │     │ email       │
│ email       │     │ created_at  │     │ password    │
│ security_*  │     └─────────────┘     └─────────────┘
└─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  products   │     │ categories  │     │  suppliers  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ name        │────▶│ name        │     │ name        │
│ sku         │     │ description │     │ contact     │
│ price       │     └─────────────┘     │ email/phone │
│ cost_price  │                         │ rating      │
│ stock_qty   │                         └─────────────┘
│ category_id │
└─────────────┘

┌─────────────┐     ┌───────────────┐     ┌─────────────┐
│  invoices   │     │ invoice_items │     │  customers  │
├─────────────┤     ├───────────────┤     ├─────────────┤
│ id (PK)     │────▶│ invoice_id    │     │ id (PK)     │
│ invoice_num │     │ product_id    │     │ name        │◀──┐
│ customer_id │─────│ quantity      │     │ email       │   │
│ total       │     │ unit_price    │     │ phone       │   │
│ status      │     │ total_price   │     │ address     │   │
│ created_at  │     └───────────────┘     └─────────────┘   │
└─────────────┘                                              │
       │                                                     │
       └─────────────────────────────────────────────────────┘

┌─────────────┐     ┌──────────────────┐
│  expenses   │     │expense_categories│
├─────────────┤     ├──────────────────┤
│ id (PK)     │     │ id (PK)          │
│ description │────▶│ name             │
│ amount      │     │ color            │
│ date        │     └──────────────────┘
│ category_id │
└─────────────┘

┌────────────────┐     ┌─────────────────────┐
│purchase_orders │     │ purchase_order_items│
├────────────────┤     ├─────────────────────┤
│ id (PK)        │────▶│ purchase_order_id   │
│ po_number      │     │ product_id          │
│ supplier_id    │     │ quantity            │
│ total_amount   │     │ unit_cost           │
│ status         │     │ total_cost          │
└────────────────┘     └─────────────────────┘

┌────────────────┐     ┌─────────────────────────┐
│ store_settings │     │ notification_preferences│
├────────────────┤     ├─────────────────────────┤
│ id (PK)        │     │ id (PK)                 │
│ store_name     │     │ user_id (FK)            │
│ store_email    │     │ low_stock_alerts        │
│ store_address  │     │ new_order_notifications │
└────────────────┘     │ payment_confirmations   │
                       │ daily_summary_reports   │
                       │ weekly_analytics_digest │
                       └─────────────────────────┘
```

### Key Tables

| Table | Description | RLS |
|-------|-------------|-----|
| profiles | User profile information with security questions | User owns data |
| user_roles | Role assignments (admin/user) | Admin manages |
| products | Product catalog | Public access |
| categories | Product categories | Public access |
| suppliers | Supplier information | Public access |
| customers | Customer database | Public access |
| invoices | Sales invoices | Public access |
| invoice_items | Invoice line items | Public access |
| expenses | Expense records | Public access |
| expense_categories | Expense categorization | Public access |
| purchase_orders | Procurement orders | Public access |
| purchase_order_items | PO line items | Public access |
| store_settings | Store configuration | Admin only |
| notification_preferences | User notification settings | User owns data |

---

## 6. Security Implementation

### 6.1 Authentication Security
- **Email/Password Authentication**: Supabase Auth
- **Password Requirements**: Minimum 6 characters
- **Security Questions**: 3 mandatory questions during registration
- **Password Recovery**: Via security question verification (no email links)

### 6.2 Session Security
- **Session-Based Authentication**: Tokens stored in sessionStorage
- **Tab Isolation**: Session invalidated when switching tabs
- **Auto-Logout**: 30-minute inactivity timeout
- **Refresh Handling**: Re-login required on page refresh

### 6.3 Row Level Security (RLS)
All database tables implement RLS policies:
- **User Data**: Only accessible by the owning user
- **Admin Data**: Restricted to users with admin role
- **Public Data**: Read access for authenticated users

### 6.4 Role Verification
- Server-side role checking via `has_role()` function
- Prevents privilege escalation attacks
- Roles stored in separate `user_roles` table

---

## 7. User Roles & Permissions

### Administrator Role
| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| Dashboard | - | ✓ | - | - |
| Inventory | ✓ | ✓ | ✓ | ✓ |
| Sales | ✓ | ✓ | ✓ | ✓ |
| Suppliers | ✓ | ✓ | ✓ | ✓ |
| Customers | ✓ | ✓ | ✓ | ✓ |
| Expenses | ✓ | ✓ | ✓ | ✓ |
| Procurement | ✓ | ✓ | ✓ | ✓ |
| Analytics | - | ✓ | - | - |
| Settings | ✓ | ✓ | ✓ | ✓ |
| User Management | ✓ | ✓ | ✓ | ✓ |

### Regular User Role
| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| Dashboard | - | ✓ | - | - |
| Inventory | ✗ | ✓ | ✗ | ✗ |
| Sales | ✓ | ✓ | ✓ | ✓ |
| Suppliers | ✗ | ✓ | ✗ | ✗ |
| Customers | ✓ | ✓ | ✓ | ✓ |
| Expenses | ✗ | ✗ | ✗ | ✗ |
| Procurement | ✗ | ✗ | ✗ | ✗ |
| Analytics | - | ✓ | - | - |
| User Profile | - | ✓ | ✓ | - |

---

## 8. Authentication Flow

### 8.1 Registration Flow
```
┌─────────┐     ┌──────────────┐     ┌───────────────┐
│  User   │────▶│ Registration │────▶│ Security      │
│         │     │ Form         │     │ Questions (3) │
└─────────┘     └──────────────┘     └───────────────┘
                                            │
                                            ▼
┌─────────┐     ┌──────────────┐     ┌───────────────┐
│Dashboard│◀────│ Auto Login   │◀────│ Create Profile│
└─────────┘     └──────────────┘     └───────────────┘
```

### 8.2 Login Flow
```
┌─────────┐     ┌──────────────┐     ┌───────────────┐
│  User   │────▶│ Login Form   │────▶│ Validate      │
│         │     │              │     │ Credentials   │
└─────────┘     └──────────────┘     └───────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
           ┌──────────────┐                                ┌───────────────┐
           │ Success      │                                │ Failure       │
           │ Set Session  │                                │ Show Error    │
           └──────────────┘                                └───────────────┘
                    │
                    ▼
           ┌──────────────┐
           │ Check Role   │
           │ Redirect     │
           └──────────────┘
```

### 8.3 Password Reset Flow
```
┌─────────┐     ┌──────────────┐     ┌───────────────┐
│  User   │────▶│ Forgot       │────▶│ Enter Email   │
│         │     │ Password     │     │               │
└─────────┘     └──────────────┘     └───────────────┘
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │ Fetch Security│
                                    │ Questions     │
                                    └───────────────┘
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │ Answer 3      │
                                    │ Questions     │
                                    └───────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
           ┌──────────────┐                                ┌───────────────┐
           │ Correct      │                                │ Incorrect     │
           │ Set New PWD  │                                │ Show Error    │
           └──────────────┘                                └───────────────┘
```

---

## 9. Technical Specifications

### 9.1 Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | Latest | Type Safety |
| Tailwind CSS | Latest | Styling |
| React Router | 6.30.1 | Routing |
| React Query | 5.83.0 | Server State |
| Recharts | 2.15.4 | Charts |
| Radix UI | Various | UI Components |
| Lucide React | 0.462.0 | Icons |

### 9.2 Backend Technologies
| Technology | Purpose |
|------------|---------|
| Supabase | Backend as a Service |
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Edge Functions | Serverless Functions |
| RLS | Security Policies |

### 9.3 Development Tools
| Tool | Purpose |
|------|---------|
| Vite | Build Tool |
| ESLint | Code Linting |
| TypeScript | Type Checking |

---

## 10. Screenshots & UI

### Main Dashboard
The dashboard provides an overview of business metrics including:
- Revenue statistics with trend indicators
- Sales charts with weekly/monthly views
- Recent transaction list
- Top-selling products
- Inventory status indicators

### Inventory Management
- Product grid/list view
- Search and filter functionality
- Stock level indicators
- Category filtering

### Sales Interface
- Invoice creation form
- Customer selection
- Product line items
- Payment processing

### Settings Panel
- Multi-section layout
- Store configuration
- User management table
- Security settings

---

## 11. Future Enhancements

### Phase 2 Features
- [ ] Multi-store support
- [ ] Barcode scanning integration
- [ ] Mobile application
- [ ] Email notifications
- [ ] SMS alerts

### Phase 3 Features
- [ ] Advanced reporting with PDF export
- [ ] Supplier portal
- [ ] Customer self-service portal
- [ ] API for third-party integrations
- [ ] Machine learning for demand forecasting

---

## 12. Conclusion

E-Trends Explorer represents a comprehensive solution for inventory and sales management. The system successfully implements:

1. **Robust Authentication**: Multi-layered security with session management and security questions
2. **Role-Based Access Control**: Clear separation between admin and user capabilities
3. **Complete CRUD Operations**: Full data management across all modules
4. **Real-Time Analytics**: Dashboard and reporting capabilities
5. **Modern UI/UX**: Responsive design with dark/light themes
6. **Secure Backend**: RLS policies protecting all sensitive data

The project demonstrates proficiency in modern web development technologies and best practices for building secure, scalable business applications.

---

## Appendix A: API Reference

### Edge Functions

#### admin-manage-users
**Endpoint:** `/functions/v1/admin-manage-users`  
**Methods:** POST  
**Authentication:** Required (Admin only)

**Actions:**
- `list` - Get all users
- `update_name` - Update user's display name
- `update_password` - Change user's password
- `update_role` - Change user's role (admin/user)
- `delete` - Delete a user account

---

## Appendix B: Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Supabase anon key |

---

## Appendix C: Installation & Setup

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Authors:** Project Team
