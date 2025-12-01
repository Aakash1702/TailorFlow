# TailorFlow

## Overview

TailorFlow is a business management platform for small tailoring shops and boutique businesses. Built with React Native and Expo, it provides a cross-platform mobile and web solution for managing customers, orders, employees, payments, and analytics. The application features a clean, modern interface with role-based access control and real-time business insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React Native with Expo SDK 54
- Uses Expo's new architecture with React 19.1.0
- Supports iOS, Android, and Web platforms
- Implements React Compiler for optimization
- Leverages native bottom tabs on iOS 26+ with fallback to standard tabs

**Navigation Pattern:** Tab-based navigation with nested stack navigators
- Five main tabs: Dashboard, Customers, Orders, Employees, More
- Each tab contains a stack navigator for hierarchical screens
- Modal presentations for create/edit flows
- Blur effects on iOS tab bar for modern aesthetic

**UI Components:**
- Custom themed components (ThemedText, ThemedView) for consistent styling
- Reanimated-powered animations with spring physics for interactions
- Keyboard-aware scroll views for form handling
- Screen components with automatic safe area and header height calculations
- Error boundary implementation for graceful error handling

**State Management:**
- Local state with React hooks (useState, useCallback)
- Focus-based data refreshing using React Navigation's useFocusEffect
- No global state management library (appropriate for current scale)

**Styling System:**
- Theme-based design with light/dark mode support
- Centralized constants for spacing, typography, border radius, and colors
- Platform-specific adaptations (iOS blur effects, Android edge-to-edge)
- Custom color palette featuring primary (#8B4049) and accent (#D4AF37) colors

### Data Storage

**Supabase Cloud Database** - Full enterprise database with:
- 10 tables with proper relationships and foreign keys
- Row Level Security (RLS) policies for multi-tenant data isolation
- Automatic shop/profile provisioning on user signup
- Real-time data sync across devices

**Database Tables:**
- `shops` - Owner information and shop settings
- `profiles` - Links users to shops with role-based access
- `customers` - Customer data with measurements (JSONB)
- `orders` - Order workflow with status tracking
- `order_items` - Individual items in orders
- `order_item_extras` - Add-ons for order items
- `employees` - Staff management with assignments
- `payments` - Payment records with multiple modes
- `activities` - Activity feed for dashboard
- `extras_presets` - Pre-configured extras options

**Offline Support:**
- AsyncStorage as local cache for offline access
- Automatic sync to Supabase when online
- Local ID remapping on sync

**Data Operations:**
- CRUD via SupabaseDataService with shop_id scoping
- Cascading deletes via foreign key constraints
- Customer balance auto-calculated from orders
- Activity logging for all significant actions

### Supabase Setup (REQUIRED)

**To see all tables in Supabase dashboard:**
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-schema.sql` 
5. Click "Run" to execute the schema
6. Check "Table Editor" - you should now see all 10 tables

**Database trigger automatically:**
- Creates a new `shop` when a user signs up
- Creates a `profile` linking user to their shop
- Adds default extras presets for the new shop

### Authentication & Authorization

**Supabase Authentication** - Fully implemented
- Email/password authentication with signup, login, logout
- OAuth providers: Google, Apple, GitHub
- Uses expo-auth-session with web-based OAuth flow compatible with Expo Go
- PKCE flow with `exchangeCodeForSession` for secure token exchange
- Password reset via email link

**OAuth Implementation:**
- AuthContext provides `signInWithOAuth(provider)` method
- Handles both token-based and authorization code flows
- Proper error handling for cancellation and provider errors
- Deep linking configured with `tailorflow://` scheme

**Session Management:**
- Supabase session stored automatically
- AuthContext provides user state and loading indicator
- Auto-refreshes session on app launch

### Business Logic

**Order Management Workflow:**
1. Pending → In Progress → Completed → Delivered
2. Employee assignment and reassignment
3. Payment tracking (partial and full payments)
4. Due date monitoring
5. Item-based order composition

**Financial Tracking:**
- Order amounts with partial payment support
- Customer outstanding balance calculation
- Multiple payment modes (cash, card, UPI, wallet, bank transfer)
- Revenue analytics by time period (7 days, 30 days, all time)

**Activity System:**
- Chronological activity feed on dashboard
- Tracks order status changes, payments, customer additions
- Relative time formatting for recent activities

## External Dependencies

### Core Framework
- **Expo**: Cross-platform development framework with managed workflow
- **React Native**: UI framework for native mobile applications
- **React Navigation**: Navigation library with stack and tab navigators

### UI & Animation
- **React Native Reanimated**: Declarative animations with worklets
- **React Native Gesture Handler**: Gesture recognition system
- **Expo Blur**: Native blur effects for iOS
- **Expo Haptics**: Tactile feedback for interactions
- **Expo Symbols**: Native SF Symbols support
- **Feather Icons**: Icon set via @expo/vector-icons

### Platform Integration
- **React Native Safe Area Context**: Safe area insets for notches/islands
- **React Native Screens**: Native screen components for performance
- **Expo Status Bar**: Status bar styling
- **Expo System UI**: System UI configuration

### Development Tools
- **TypeScript**: Type safety and developer experience
- **ESLint**: Code linting with Expo and Prettier configs
- **Prettier**: Code formatting
- **Babel Module Resolver**: Path aliasing (@/ for root imports)

### Storage & Utilities
- **AsyncStorage**: Client-side key-value storage
- **Expo Linking**: Deep linking support
- **Expo Constants**: App configuration access
- **Expo Image**: Optimized image component
- **React Native Keyboard Controller**: Advanced keyboard handling

### Deployment
- **Expo Web Browser**: In-app browser functionality
- Custom build scripts for Replit deployment with Metro bundler
- Static hosting with QR code landing page for mobile access

## Recent Changes

**December 1, 2025 - OAuth Authentication**

1. **OAuth Sign-in Implementation**
   - Added Google, Apple, and GitHub OAuth providers via Supabase
   - Uses expo-auth-session with web-based flow for Expo Go compatibility
   - Properly handles PKCE authorization code exchange
   - Error handling for cancellation and provider errors

2. **AuthScreen UI Updates**
   - Added OAuth buttons section with provider-specific styling
   - Google: White background with Google logo
   - Apple: Black background with Apple logo
   - GitHub: Dark gray background with GitHub logo
   - "or continue with" divider between email and OAuth

3. **AuthContext Improvements**
   - signInWithOAuth method supports all three providers
   - Handles both token-based and authorization code flows
   - Proper session establishment after OAuth callback

**November 28, 2025 - MVP Complete**

1. **Employee Assignment System**
   - Modal picker for assigning/unassigning employees to orders
   - Employee workload tracking via assignedOrders array
   - Automatic cleanup when orders are deleted

2. **Customer Balance Synchronization**
   - Outstanding balance accurately calculated from orders and payments
   - updateCustomerBalance function called after all order/payment operations
   - Handles order creation, updates, deletion, and payment recording

3. **Order Amount Flexibility**
   - Direct amount input for orders without line items
   - Automatic calculation from items when items are added
   - Validation to ensure positive order amounts

4. **Payment Tracking**
   - paidAmount persists correctly when editing orders
   - Balance correctly clamped when order total is reduced below paid amount
   - Multiple payment modes supported

5. **Settings Screen**
   - Shop profile editing with name and phone
   - Data summary showing counts for all entities
   - JSON export of all data via Share API
   - Clear all data with confirmation

6. **Dashboard Analytics**
   - Real-time KPIs for orders, revenue, and customers
   - Revenue breakdown by status (pending, in-progress, completed)
   - Recent activity feed

## Project Structure

```
/screens
  - DashboardScreen.tsx  # Home with stats and activity feed
  - CustomersScreen.tsx  # Customer list with search
  - AddCustomerScreen.tsx  # Customer CRUD with measurements
  - OrdersScreen.tsx  # Order list with status filters
  - AddOrderScreen.tsx  # Order creation/editing
  - OrderDetailScreen.tsx  # Order details, status updates, employee assignment
  - EmployeesScreen.tsx  # Employee list
  - AddEmployeeScreen.tsx  # Employee CRUD with roles
  - PaymentsScreen.tsx  # Payment list with customer filter
  - AddPaymentScreen.tsx  # Payment recording
  - SettingsScreen.tsx  # Shop settings, export, data management
  - AnalyticsScreen.tsx  # Business analytics

/utils
  - storage.ts  # AsyncStorage CRUD operations, balance calculations

/types
  - index.ts  # TypeScript interfaces for all data models

/components
  - Card.tsx, ThemedText.tsx, ThemedView.tsx  # UI primitives
  - ErrorBoundary.tsx  # App crash recovery
  - ScreenScrollView.tsx, ScreenKeyboardAwareScrollView.tsx  # Layout helpers

/constants
  - theme.ts  # Colors, spacing, typography, border radius
```