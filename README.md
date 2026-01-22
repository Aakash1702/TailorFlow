# TailorFlow

A modern, cross-platform mobile application for managing tailoring businesses. Built with React Native and Expo, TailorFlow helps small tailoring shops and boutiques streamline their operations with an elegant, professional interface.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Framework](https://img.shields.io/badge/Framework-React%20Native%20%2B%20Expo-purple)
![Database](https://img.shields.io/badge/Database-Supabase-green)

## Features

### Customer Management
- Store customer profiles with contact information
- Record detailed body measurements (chest, waist, shoulder, length, etc.)
- Track customer order history and outstanding balances
- Quick search and filter capabilities

### Order Tracking
- Create and manage orders with multiple items
- Track order status: Pending → In Progress → Completed → Delivered
- Set due dates and receive notifications
- Assign employees to orders
- Add extras and customizations (embroidery, lining, zips, etc.)

### Employee Management
- Manage staff profiles and contact details
- Define roles (Master Tailor, Tailor, Helper, etc.)
- Track employee workload and order assignments
- Monitor individual performance

### Payment Processing
- Record payments with multiple modes (Cash, Card, UPI, Wallet, Bank Transfer)
- Track partial payments and outstanding balances
- Generate payment receipts
- Customer-wise payment history

### Business Analytics
- Real-time dashboard with key metrics
- Revenue tracking (daily, weekly, monthly)
- Order completion rates
- Pending payment summaries
- Activity feed for recent actions

### Pattern Generation (Beta)
- Generate sewing patterns from measurements
- Support for multiple garment types (Blouse, Kurti, Frock)
- SVG pattern output for printing
- Customizable options (sleeve type, neck style, ease)

## Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo SDK 54** - Managed workflow with native capabilities
- **React Navigation 7** - Tab and stack navigation
- **React Native Reanimated** - Smooth animations
- **TypeScript** - Type-safe development

### Backend & Database
- **Supabase** - PostgreSQL database with real-time sync
- **Row Level Security** - Multi-tenant data isolation
- **Supabase Auth** - Email/password and OAuth authentication

### Design System
- Custom themed components
- Light/dark mode support
- Thoughtful color palette with semantic meaning
- Premium typography (Cormorant Garamond + Inter)
- Responsive layouts for all screen sizes

## Screenshots

### Dashboard
Clean, color-coded dashboard showing key business metrics at a glance.

### Order Management
Track orders through their lifecycle with status updates and employee assignments.

### Customer Profiles
Detailed customer profiles with measurements and order history.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/Aakash1702/TailorFlow.git
cd TailorFlow
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database
Run the SQL schema in your Supabase SQL editor:
```bash
# Copy contents of supabase-schema.sql to Supabase SQL Editor
```

5. Start the development server
```bash
npm run dev
```

6. Run on your device
- Scan the QR code with Expo Go (iOS/Android)
- Or press `w` to open in web browser

## Project Structure

```
TailorFlow/
├── app.config.ts          # Expo configuration
├── App.tsx                 # App entry point
├── components/             # Reusable UI components
│   ├── Card.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   └── ...
├── constants/
│   └── theme.ts            # Colors, spacing, typography
├── contexts/
│   ├── AuthContext.tsx     # Authentication state
│   └── DataContext.tsx     # Data management
├── hooks/                  # Custom React hooks
├── lib/
│   └── supabase.ts         # Supabase client
├── navigation/             # Navigation configuration
├── screens/                # App screens
│   ├── DashboardScreen.tsx
│   ├── CustomersScreen.tsx
│   ├── OrdersScreen.tsx
│   └── ...
├── types/                  # TypeScript definitions
└── utils/                  # Utility functions
```

## Database Schema

The app uses 10 interconnected tables:

- **shops** - Business information
- **profiles** - User profiles linked to shops
- **customers** - Customer data with measurements
- **orders** - Order records with status tracking
- **order_items** - Individual items in orders
- **order_item_extras** - Add-ons for items
- **employees** - Staff management
- **payments** - Payment records
- **activities** - Activity log for dashboard
- **extras_presets** - Predefined extras options

## Authentication

TailorFlow supports multiple authentication methods:
- Email/Password signup and login
- Google OAuth
- Apple Sign-In
- Password reset via email

## Design Philosophy

The app follows a **"rich, simple, stylish, and minimal"** design approach:

- **Color-coded sections** for intuitive navigation
- **Soft, pastel tones** that feel premium and professional
- **White cards** with subtle shadows for depth
- **Strategic use of color** to convey meaning (green for success, amber for revenue, etc.)
- **Clean typography** with serif headings and sans-serif body text

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Aakash**
- GitHub: [@Aakash1702](https://github.com/Aakash1702)

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Feather Icons](https://feathericons.com/)
