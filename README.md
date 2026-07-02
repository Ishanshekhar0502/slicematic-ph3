# 🍕 SliceMatic Stage 3 Pizza Ordering System

Welcome to **SliceMatic**, a production-ready, digital pizza ordering application. This project represents the evolution of the Stage 2 python prototype into a high-integrity, modern web app using Next.js 15, TypeScript, Tailwind CSS, and Supabase.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL with Row-Level Security)
- **State Management**: React Context (`CartContext` and `ToastContext`)
- **Icons**: Lucide React

---

## 🌟 Key Features

1. **Artisanal Branding**: Forest Green (`#1F3A2E`), Warm Cream (`#F8F5F0`), and Gold (`#C8A96A`) theme with responsive layouts.
2. **Interactive Customizer**: Select crust types, pizza flavors, and extra toppings with quantity limits (capped at 10 pizzas total).
3. **Robust Pricing Engine**: Ported exactly from Stage 2 logic.
   - Calculates 18% GST.
   - Triggers a **10% discount** when ordering 5 or more pizzas.
   - Emulates python's `ROUND_HALF_UP` rounding to 2 decimal places.
4. **Secure Checkout**: Integrates Supabase Sign In / Sign Up with strict name and Indian phone number validation.
5. **Interactive Admin Dashboard**:
   - Live KPI cards: Revenue, Total Orders, Average Order Value, Top-Selling Pizza, Peak Ordering Hour.
   - Live Order Queue: Manage states (*Pending*, *Preparing*, *Completed*, *Cancelled*).
   - Automated Admin Assignment: Any email ending in `@slicematic.com` is auto-promoted to admin by database triggers.

---

## 🚀 Getting Started

### 1. Database Setup
Execute the [schema.sql](schema.sql) file in your Supabase project's **SQL Editor** to initialize the tables (`profiles`, `menus`, `orders`, `order_line_items`), triggers, policies, and seed data.

### 2. Environment Configuration
Create a `.env.local` file at the root and fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Locally
Install dependencies and start the development server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
