# Gastos Tracker 💸

A modern, minimalist expense tracking application built to help you manage your daily budget, track expenses, and visualize your spending habits. Built with speed and performance in mind using the latest web technologies.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

* **Daily Dashboard**: Set daily budget goals and track real-time progress.
* **Smart Insights**: Automated analysis of your spending (e.g., "Spending is down 10% from last month").
* **Visual Analytics**: Interactive charts using Recharts to visualize income vs. expenses.
* **Secure Authentication**: Full email/password login powered by Supabase.
* **Transaction Management**: Easy add, edit, and delete functionality for income and expenses.
* **CSV Export**: Download your transaction history for external analysis.
* **Responsive Design**: Fully mobile-optimized UI.
* **Dark Mode**: Built-in support for light and dark themes.

## 🛠️ Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
* **Backend & Auth**: [Supabase](https://supabase.com/)
* **Charts**: [Recharts](https://recharts.org/)
* **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* pnpm (recommended) or npm
* A Supabase account

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/gastos-tracking-app.git](https://github.com/your-username/gastos-tracking-app.git)
    cd gastos-tracking-app
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    Run the SQL scripts provided in `scripts/fix-db.sql` in your Supabase SQL Editor to set up the necessary tables, storage buckets, and Row Level Security (RLS) policies.

5.  **Run the development server**
    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

├── app/ # Next.js App Router pages and layouts ├── components/ │ ├── ui/ # Reusable UI components (buttons, inputs, etc.) │ ├── charts/ # Recharts components │ └── ... # Feature-specific components (forms, dashboards) ├── hooks/ # Custom React hooks ├── lib/ # Utilities and Supabase configuration ├── public/ # Static assets └── styles/ # Global CSS and Tailwind configuration


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
