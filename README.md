# Garage Dashboard

A modern garage management dashboard built with React, Vite, and Supabase.

## Features

- **Inventory Management**: Track and manage parts and supplies.
- **Job Tracking**: Manage work orders and service history.
- **Billing & Invoicing**: Create and manage invoices for customers.
- **Service Packages**: Standardized service templates for quick job creation.
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui.

## Technologies

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database/Auth**: [Supabase](https://supabase.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd garage-dashboard
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build locally
- `npm run test`: Run unit tests
