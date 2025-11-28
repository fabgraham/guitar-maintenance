# Guitar Maintenance Tracker

A modern web application built with Next.js to help guitarists track the maintenance history of their instrument collection. Keep your guitars playing their best by monitoring string changes, setups, and repairs.

## 🚀 Features

- **Dashboard Overview**: Get an at-a-glance view of your collection's health.
  - **Urgent**: Guitars that need immediate attention.
  - **Due Soon**: Instruments approaching their maintenance schedule.
  - **Good**: Guitars that have been recently maintained.
- **Inventory Management**: Add, edit, and remove guitars from your digital collection.
- **Maintenance Logs**: Detailed history for every service, string change, or repair.
- **Smart Status**: Automatically calculates maintenance status based on the last service date.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Data Persistence**: Your data is saved locally in your browser (LocalStorage).

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context + useReducer

## 🏁 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fabgraham/guitar-maintenance.git
   cd guitar-maintenance
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── guitar/[id]/  # Guitar detail view
│   ├── inventory/    # Collection management
│   ├── settings/     # App settings
│   └── page.tsx      # Dashboard
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks (state management)
├── types/            # TypeScript interfaces
└── utils/            # Helper functions (dates, storage, seed data)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
