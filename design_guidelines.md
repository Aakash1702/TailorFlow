# TailorFlow Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - This is a business management platform with role-based access control (Admin, Tailor, Manager).

**Implementation:**
- Use email/password authentication (business context makes SSO less critical)
- Include "Remember Me" option for convenience
- Login screen displays TailorFlow logo prominently
- Post-login onboarding for first-time users to set up shop details
- Account screen includes:
  - User profile with role badge (Admin/Tailor/Manager)
  - Shop settings (business name, contact info)
  - Log out with confirmation
  - Delete account nested under Settings > Account > Delete (Admin only)

### Navigation Structure
**Tab Navigation** (5 tabs) with the following hierarchy:

1. **Dashboard** (Home icon) - Overview and quick stats
2. **Customers** (Users icon) - Customer management
3. **Orders** (Shopping bag icon, CENTER) - Core action for creating/managing orders
4. **Employees** (Briefcase icon) - Employee and task management
5. **More** (Menu icon) - Payments, Analytics, Settings

**Information Architecture:**
- Orders tab is the central feature (primary business activity)
- More tab contains secondary features: Payments, Analytics, Inventory, Settings
- All screens use stack navigation within their respective tabs

### Root-Level Modals
- Create/Edit Order (full-screen modal from Orders tab FAB)
- Create/Edit Customer (modal from Customers tab)
- Create/Edit Employee (modal from Employees tab)
- Invoice Detail (modal from Payments)
- Filter/Search panels (slide-in modals)

## Screen Specifications

### 1. Dashboard (Home Tab)
**Purpose:** Quick overview of business health and navigation hub

**Layout:**
- **Header:** Custom transparent header with "TailorFlow" wordmark and notification bell (right)
- **Main Content:** Scrollable view with safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Structure:**
  - Stats Card Grid (2x2): Active Orders, Completed Today, Today's Revenue, Pending Payments
  - Quick Actions Section: 6 navigation cards in 2x3 grid linking to Customers, Orders, Employees, Payments, Inventory, Analytics
  - Recent Activity Feed (last 5 orders with status indicators)

**Components:**
- Stat cards with large numbers, icon, and subtle background tint
- Navigation cards with Feather icons and labels
- List items with avatar/icon, text, and timestamp

### 2. Customer Management
**Purpose:** View, search, and manage customer profiles

**Layout:**
- **Header:** Default navigation header with search bar and "Add Customer" button (right, plus icon)
- **Main Content:** FlatList with safe area insets: bottom = tabBarHeight + Spacing.xl
- **Structure:**
  - Search bar (sticky at top when scrolling)
  - Customer cards showing name, phone, last order date, outstanding balance

**Customer Detail Screen:**
- Stack navigation modal
- Tabs: Profile, Measurements, Orders, Images, Notes
- Header has Edit button (right, edit icon)
- Scrollable content with safe area insets: bottom = insets.bottom + Spacing.xl

### 3. Order Management
**Purpose:** Create and track tailoring orders through their lifecycle

**Layout:**
- **Header:** Default navigation header with filter button (right, filter icon)
- **Main Content:** FlatList with safe area insets: bottom = tabBarHeight + Spacing.xl
- **Floating Action Button:** Positioned bottom-right with safe area inset: bottom = tabBarHeight + Spacing.xl, right = Spacing.xl
  - Shadow specifications: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- **Structure:**
  - Status filter chips (Pending, In Progress, Completed, Delivered)
  - Order cards with customer name, order ID, status badge, due date, and thumbnail

**Create/Edit Order Modal:**
- Full-screen modal with custom header (Cancel left, Save right)
- Scrollable form with sections: Customer Selection, Order Details, Measurements, Images, Notes, Pricing
- Submit button at bottom of form (not in header)
- Safe area insets: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Order Detail Screen:**
- Stack navigation
- Status stepper showing progress: Pending → In Progress → Completed → Delivered
- Collapsible sections for details, customer info, measurements, images
- Action buttons: Update Status, Edit Order, Generate Invoice

### 4. Employee Management
**Purpose:** Manage staff, assign tasks, track attendance

**Layout:**
- **Header:** Default navigation header with "Add Employee" button (right, plus icon)
- **Main Content:** FlatList with safe area insets: bottom = tabBarHeight + Spacing.xl
- **Structure:**
  - Employee cards with avatar, name, role badge, current tasks count, and performance indicator

**Employee Detail Screen:**
- Tabs: Profile, Assigned Tasks, Attendance, Payroll
- Task list showing order assignments with due dates and status
- Header has Edit button (right)

### 5. More Tab
**Purpose:** Access to Payments, Analytics, Inventory, and Settings

**Layout:**
- **Header:** Custom transparent header with "More" title
- **Main Content:** Scrollable view with safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Structure:**
  - Menu list items with icons, labels, and chevron-right indicators
  - Sections: Financial (Payments, Analytics), Inventory, Account (Settings, Profile, Log Out)

### 6. Payments Screen
**Purpose:** Invoice generation, payment tracking, financial summaries

**Layout:**
- **Header:** Default navigation header with "Create Invoice" button (right)
- **Main Content:** ScrollView with tabs: Outstanding, Paid, All
- **Structure:**
  - Revenue summary card at top (daily/weekly/monthly filters)
  - Payment list items with customer name, amount, payment mode, status badge

**Invoice Detail Modal:**
- Full-screen modal with header
- Itemized charges table
- Payment mode selection
- Action buttons: Send Invoice, Record Payment, Download PDF

### 7. Analytics & Reports
**Purpose:** Business insights and performance metrics

**Layout:**
- **Header:** Default navigation header with date range selector (right)
- **Main Content:** Scrollable view with safe area insets: bottom = insets.bottom + Spacing.xl
- **Structure:**
  - Revenue chart (line graph, 7-day or 30-day view)
  - KPI cards: Total Orders, Total Revenue, Average Order Value, Completion Rate
  - Top customers list
  - Employee performance comparison

## Design System

### Color Palette
**Primary:** 
- Maroon/Burgundy: #8B4049 (primary actions, active states)
- Soft Gold: #D4AF37 (accents, success states)

**Neutrals:**
- Background: #FAFAFA (app background)
- Surface: #FFFFFF (cards, modals)
- Text Primary: #1A1A1A
- Text Secondary: #6B6B6B
- Border: #E5E5E5

**Status Colors:**
- Pending: #F59E0B (amber)
- In Progress: #3B82F6 (blue)
- Completed: #10B981 (green)
- Delivered: #8B5CF6 (purple)
- Overdue: #EF4444 (red)

### Typography
**Font Family:** Poppins (primary), System fallback

**Scale:**
- Heading 1: 28pt, SemiBold (Dashboard title)
- Heading 2: 22pt, SemiBold (Section headers)
- Heading 3: 18pt, Medium (Card titles)
- Body: 16pt, Regular (Primary text)
- Caption: 14pt, Regular (Secondary text)
- Small: 12pt, Regular (Timestamps, labels)

### Spacing System
- xs: 4pt
- sm: 8pt
- md: 16pt
- lg: 24pt
- xl: 32pt
- xxl: 48pt

### Component Specifications

**Stat Cards:**
- White background with subtle border
- 16pt padding
- Icon in soft gold tint circle (top-left)
- Large number (32pt, SemiBold) in maroon
- Label below in text-secondary

**Navigation Cards:**
- White background with 1pt border
- 20pt padding
- Feather icon (32pt) in maroon
- Label (16pt, Medium) below icon
- Press feedback: scale to 0.97, reduce opacity to 0.8

**Customer/Employee/Order Cards:**
- White background with subtle shadow
- 16pt padding
- Avatar/icon on left (48pt circle)
- Text content in center (name, details)
- Badge/status indicator on right
- Press feedback: background tint to #F5F5F5

**Status Badges:**
- Rounded pill shape (24pt height)
- Status-colored background at 15% opacity
- Status-colored text (14pt, Medium)
- 8pt horizontal padding

**Floating Action Button:**
- 56pt circle, maroon background
- White plus icon (24pt)
- Elevation shadow as specified above
- Press feedback: scale to 0.95

**Form Inputs:**
- 48pt height
- 1pt border, #E5E5E5
- 12pt padding horizontal
- Focus state: border color changes to maroon, 2pt width
- Error state: border color #EF4444

**Primary Button:**
- 48pt height, maroon background
- White text (16pt, Medium)
- 16pt horizontal padding
- Press feedback: background darkens by 10%

**Secondary Button:**
- 48pt height, transparent background
- 1pt maroon border
- Maroon text (16pt, Medium)
- Press feedback: background maroon at 10% opacity

### Required Assets

**Logo:**
- Generate TailorFlow logo: minimalist "T" formed by thread loop inside circle
- Variants: Full logo with wordmark, Icon only
- Colors: Maroon (#8B4049) and soft gold (#D4AF37)

**Icons:**
- Use Feather icons from @expo/vector-icons for all UI elements
- No custom icon assets needed

**No additional image assets required** - All content is user-generated (customer photos, fabric images, completed designs)

### Accessibility
- Minimum touch target: 44pt x 44pt
- Color contrast ratio: minimum 4.5:1 for text
- All interactive elements have visible press states
- Form inputs have clear labels and error messages
- Status information conveyed through both color and text labels